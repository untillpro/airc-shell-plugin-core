/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import { call, put, takeLatest, select } from 'redux-saga/effects'
import { Logger } from 'airc-shell-core';
import i18next from 'i18next';
import lc from 'langcode-info';

import {
    getCollection,
    processEntityData,
    getFilterByString,
    checkEntries,
    buildRequestEntires,
    checkForEmbededTypes,
    prepareCopyData,
} from '../classes/helpers';

import * as Selectors from './Selectors';

import {
    TYPE_LIST,
    TYPE_COLLECTION,
    C_COLLECTION_REQUIRED_FIELDS,
    C_COLLECTION_REQUIRED_CLASSIFIERS,
    C_COLLECTION_ENTITY
} from '../classes/contributions/Types';

import {
    SET_COLLECTION_LOADING,
    SET_ENTITY_LOADING,
    SET_ENTITY_DATA_PROCESSING,
    LIST_DATA_FETCH_SUCCEEDED,
    PROCESS_DATA_FETCH_SUCCEEDED,
    SEND_ERROR_MESSAGE,
    ENTITY_DATA_FETCH_SUCCEEDED,
    SEND_CANCEL_MESSAGE,
    SET_PLUGIN_LANGUAGE,
    SEND_DO_GENERATE_REPORT_MESSAGE,
    ENTITY_LIST_SET_SHOW_DELETED,
} from '../actions/Types';

import {
    SAGA_FETCH_LIST_DATA,
    SAGA_FETCH_REPORT,
    SAGA_PROCESS_DATA,
    SAGA_FETCH_ENTITY_DATA,
    SAGA_PROCESS_ENTITY_DATA,
    SAGA_SET_PLUGIN_LANGUAGE,
    SAGA_SET_LIST_SHOW_DELETED,
} from './Types';

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* _fetchListData(action) {
    const entity = action.payload;
    const context = yield select(Selectors.context);
    const list = yield select(Selectors.list);
    const locations = yield select(Selectors.locations);

    const { contributions } = context;
    const { page, pageSize, showDeleted } = list;
    const manual = !!contributions.getPointContributionValue(TYPE_LIST, entity, 'manual');

    let doProps = {
        required_fields: contributions.getPointContributionValues(TYPE_COLLECTION, entity, C_COLLECTION_REQUIRED_FIELDS),
        required_classifiers: contributions.getPointContributionValues(TYPE_COLLECTION, entity, C_COLLECTION_REQUIRED_CLASSIFIERS),
        filter_by: getFilterByString(context, entity),
    };

    let resource = contributions.getPointContributionValue(TYPE_COLLECTION, entity, C_COLLECTION_ENTITY) || entity;

    if (manual) {
        doProps = {
            ...doProps,
            page: page + 1,
            page_size: pageSize,
            show_deleted: !!showDeleted,
            //order_by: {} //TODO
        };
    } else {
        doProps["show_deleted"] = true;
    }

    try {
        yield put({ type: SET_COLLECTION_LOADING, payload: true });

        const ops = {
            resource,
            wsid: locations,
            props: doProps
        };

        const data = yield call(getCollection, context, ops);

        yield put({ type: LIST_DATA_FETCH_SUCCEEDED, payload: { ...data, ...action.payload.props } });
    } catch (e) {
        yield put({ type: SET_COLLECTION_LOADING, payload: false });
        yield put({ type: SEND_ERROR_MESSAGE, payload: { text: e.message, description: e.message } });
    }
}

function* _processData(action) {
    const { entity, data, entries } = action.payload;
    const context = yield select(Selectors.context);
    const { contributions } = context;

    const manual = !!contributions.getPointContributionValue(TYPE_LIST, entity, 'manual');

    try {
        const res = yield call(processEntityData, context, entity, data, entries);

        yield put({ type: PROCESS_DATA_FETCH_SUCCEEDED, payload: { result: res, data } });

        if (manual) {
            yield put({ type: SAGA_FETCH_LIST_DATA, payload: entity });
        }
    } catch (e) {
        yield put({ type: SET_COLLECTION_LOADING, payload: false });
        yield put({ type: SEND_ERROR_MESSAGE, payload: { text: e.message, description: e.message } });
    }
}

function* _fetchEntityData(action) {
    const { resource, entries, isCopy } = action.payload;
    const context = yield select(Selectors.context);
    const locations = yield select(Selectors.locations);
    const { contributions } = context;

    const verifiedEntries = checkEntries(entries);
    let isNew = !(verifiedEntries && verifiedEntries.length > 0);
    let data, classifiers;

    if (isNew) {
        yield put({ type: ENTITY_DATA_FETCH_SUCCEEDED, payload: { result: null, isNew, isCopy: false } });
    } else {
        try {
            yield put({ type: SET_ENTITY_LOADING, payload: true });

            let wsid = locations[0];
            let requestEntries = buildRequestEntires(verifiedEntries);
            let required_classifiers = contributions.getPointContributionValues(TYPE_COLLECTION, resource, C_COLLECTION_REQUIRED_CLASSIFIERS);

            const doProps = {
                entries: requestEntries,
                required_classifiers,
                show_deleted: true
            };

            const result = yield call(getCollection, context, { resource, wsid, props: doProps }, false);

            Logger.log(result, 'SAGA.fetchEntityData() fetched data:', "rootSaga.fetchEntityData");

            const { Data, resolvedData } = result;

            if (resolvedData && resolvedData.length > 0) {
                classifiers = Data ? Data['classifiers'] : {};
                data = checkForEmbededTypes(context, resource, resolvedData[0]);
            } else {
                classifiers = null;
                data = [];
            }

            if (isCopy) {
                data = prepareCopyData(data);
            }

            yield put({ type: ENTITY_DATA_FETCH_SUCCEEDED, payload: { data, classifiers, isNew, isCopy } });
        } catch (e) {
            yield put({ type: SET_ENTITY_LOADING, payload: false });
            yield put({ type: SEND_ERROR_MESSAGE, payload: { text: e.message, description: e.message } });
        }
    }
}

function* _processEntityData(action) {
    let { entity, data, entries } = action.payload
    const context = yield select(Selectors.context);

    if (_.size(data) === 0) {
        yield put({ type: SEND_CANCEL_MESSAGE, payload: { refresh: true } });
    } else {
        try {
            yield put({ type: SET_ENTITY_DATA_PROCESSING, payload: true });
            yield call(processEntityData, context, entity, data, entries);

            yield put({ type: SET_ENTITY_DATA_PROCESSING, payload: false });
            yield put({ type: SEND_CANCEL_MESSAGE, payload: { refresh: true } });
        } catch (e) {
            yield put({ type: SET_ENTITY_LOADING, payload: false });
            yield put({ type: SEND_ERROR_MESSAGE, payload: { text: e.message, description: e.message } });
        }
    }
}

//TODO - continue with REPORTS
function* _fetchReport(action) {
    const locations = yield select(Selectors.locations);
    const { report, from, to, filterBy, props } = action.payload;

    yield put({
        type: SEND_DO_GENERATE_REPORT_MESSAGE,
        payload: {
            locations: locations.locations,
            report,
            from,
            to,
            filterBy,
            props,
        }
    });
}

function* _setPluginLanguage(action) {
    const langCode = action.payload;

    if (_.isString(langCode)) {
        const lang = lc.langByHex(langCode);
        const lex = lang.lex();

        if (_.isString(lex)) {
            if (i18next.languages.indexOf(lex) >= 0) {
                yield call(i18next.changeLanguage.bind(i18next), lex);
                yield put({
                    type: SET_PLUGIN_LANGUAGE,
                    payload: langCode
                });
            } else {
                yield put({
                    type: SEND_ERROR_MESSAGE,
                    payload: {
                        description: `setLanguage error: lang "${lex}" is not presented in current laguages list; allowed languages are: ${i18next.languages}`
                    }
                });
            }
        } else {
            yield put({
                type: SEND_ERROR_MESSAGE,
                payload: {
                    description: `setLanguage error: wrong locale specified: "${lex}"; string expected`
                }
            });
        }
    }
}

function* _setListShowDeleted(action) {
    const entity = yield select(Selectors.entity);
    const contributions = yield select(Selectors.contributions);

    const manual = !!contributions.getPointContributionValue(TYPE_LIST, entity, 'manual');

    yield put({
        type: ENTITY_LIST_SET_SHOW_DELETED,
        payload: !!action.payload
    });

    if (manual) {
        yield put({
            type: SAGA_FETCH_LIST_DATA,
            payload: entity
        });
    }
}

function* rootSaga() {
    yield takeLatest(SAGA_FETCH_LIST_DATA, _fetchListData);
    yield takeLatest(SAGA_FETCH_REPORT, _fetchReport);
    yield takeLatest(SAGA_PROCESS_DATA, _processData);
    yield takeLatest(SAGA_FETCH_ENTITY_DATA, _fetchEntityData);
    yield takeLatest(SAGA_PROCESS_ENTITY_DATA, _processEntityData);
    yield takeLatest(SAGA_SET_PLUGIN_LANGUAGE, _setPluginLanguage);
    yield takeLatest(SAGA_SET_LIST_SHOW_DELETED, _setListShowDeleted);
}

export default rootSaga;