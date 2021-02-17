/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import StateMachineStep from '../StateMachineStep';
import { MessageInit, MessageNotify } from '../messages';
import EntityEditStep from './EntityEditStep';
//import EntityMassEditStep from './EntityMassEditStep';

import {
    TYPE_LIST,
    TYPE_COLLECTION,
    C_COLLECTION_ENTITY,
    C_COLLECTION_REQUIRED_CLASSIFIERS,
    C_COLLECTION_REQUIRED_FIELDS,
} from '../contributions/Types';

import {
    mergeDeep,
    getCollection,
    processData,
    checkEntries,
    isValidLocations,
    isValidEntity,
    getFilterByString
    //checkEntry
} from '../helpers';

const INITIAL_STATE = {
    entity: null,
    locations: [],
    data: [],
    classifiers: null,
    resolvedData: [],
    manual: false,
    showDeleted: false,
    total: 0,
    page: 0,
    pages: -1,
    pageSize: 20,
    order: [
        {
            id: "id",
            desc: false
        }
    ],
    filter: [],
}

class RenderEntityStep extends StateMachineStep {
    constructor(...args) {
        super(args);

        _.each(INITIAL_STATE, (value, param) => {
            this[param] = value;
        });
    }

    getName() {
        return 'RenderEntityStep';
    }

    async MessageInit(msg, context) {
        const { contributions } = context;
        const { entity, locations } = msg;

        if (!isValidEntity(context, entity)) {
            this.error(this.getName() + '.MessageInit() exception: entity not specified or wrong given: ' + entity.toString());
        }

        if (!isValidLocations(locations)) {
            this.error(this.getName() + '.MessageInit() exception: locations not specified or wrong given: ' + locations.toString());
        }

        this.entity = entity;
        this.locations = locations;

        this.manual = !!contributions.getPointContributionValue(TYPE_LIST, entity, 'manual'); // подумать чтобы передавать этот параметр извне

        return this.fetchListData(context);
    }

    async MessageNotify(msg, context) {
        if (msg.refresh) {
            return this.fetchListData(context);
        } else {
            return {
                changedData: {
                    list: this.list()
                }
            };
        }
    }

    async MessageNeedEdit(msg) {
        return {
            message: new MessageInit(msg),
            newStep: new EntityEditStep()
        };
    }

    async MessageNeedMassEdit() {
        //TOIMPLEMENT
        this.error("RenderEntityStep.MessageNeedMassEdit() not implemented yet;")
    }

    async MessageCancel() {
        return {
            pop: true,
            message: new MessageNotify(),
        };
    }

    async MessageRefreshListData(msg, context) {
        return await this.fetchListData(context);
    }

    async MessageLanguageChanged(msg, context) {
        return await this.fetchListData(context);
    }

    async MessageProcessItemData(msg, context) {
        const { api, contributions } = context;
        let { entries, data } = msg;
        const { entity } = this;

        if (!entries) this.error('Error occured while MessageDeleteItem(): entries not specified', msg);
        if (!api || !contributions) this.error('Can\'t fetch entity item data.', api, contributions);
        if (!entity) this.error('Entity are not specified.', entity);
        if (!_.isPlainObject(data)) this.error('Wrong item data specified; plain object expected.', data);

        entries = checkEntries(entries);

        if (entries.length === 0) return;

        return processData(context, entity, data, entries).then((res) => {
            if (res && _.isArray(res) && res.length > 0) {
                _.each(res, (d) => {
                    if (d && d.result === "ok" && d.ID && d.ID > 0) {
                        const index = _.findIndex(this.resolvedData, o => o.id === d.ID);

                        if (index >= 0) {
                            this.resolvedData[index] = mergeDeep(this.resolvedData[index], data);
                        };
                    }
                });

                if (this.manual) {
                    return this.fetchListData(context);
                } else {
                    return {
                        changedData: {
                            list: this.list()
                        }
                    }
                }
            }
        });
    }

    async MessageSetPage(msg, context) {
        const { page } = msg;

        if (page >= 0 && typeof page === 'number') {
            this.page = page;
        }

        if (this.manual) {
            return this.fetchListData(context);
        }

        return {
            changedData: {
                list: this.list()
            }
        }
    }

    async MessageSetPageSize(msg, context) {

        const { pageSize } = msg;

        if (pageSize && typeof pageSize === 'number') {
            this.pageSize = pageSize;
            this.page = 0;
        }

        if (this.manual) {
            return this.fetchListData(context);
        }

        return {
            changedData: {
                list: this.list()
            }
        }
    }

    async MessageSetShowDeleted(msg, context) {
        const { showDeleted } = msg;

        this.showDeleted = !!showDeleted;

        if (this.manual) {
            return this.fetchListData(context);
        }

        return {
            changedData: {
                list: this.list()
            }
        }
    }

    async MessageSetOrder(msg, context) {
        const { order } = msg;

        if (order) {
            this.order = order;
        }

        if (this.manual) {
            return this.fetchListData(context);
        }

        return {
            changedData: {
                list: this.list()
            }
        }
    }

    async MessageSetFilter(msg, context) {
        this.filter = {};

        if (this.manual) {
            return this.fetchListData(context);
        }

        return {
            changedData: {
                list: this.list()
            }
        }
    }
    async MessageNeedNavigation(msg, context) {
        /*
            TODO for manual mode - в том плане, что если навигацией достигается конец resolvedData, то для мануального режима надо попробовать взять 
            следующую страницу, и если это удается, то переписать переменные в степе, включая data и resolvedData
        */

        const { id } = msg;

        let prev = null;
        let next = null;

        if (id && id > 0 && this.resolvedData && this.resolvedData.length > 0) {
            const data = this.resolvedData;

            const index = _.findIndex(data, (o) => { return o.id === id; });

            if (index >= 0) {
                if (index > 0) {
                    prev = data[index - 1].id;
                }

                if (data[index + 1]) {
                    next = data[index + 1].id;
                }
            }
        }

        return {
            changedData: {
                prevEntity: prev,
                nextEntity: next
            }
        };
    }

    async fetchListData(context) {
        const { entity, locations: wsid, page, pageSize, showDeleted, manual } = this;
        const { contributions } = context;

        let resource = contributions.getPointContributionValue(TYPE_COLLECTION, entity, C_COLLECTION_ENTITY) || entity;

        let doProps = {
            required_fields: contributions.getPointContributionValues(TYPE_COLLECTION, entity, C_COLLECTION_REQUIRED_FIELDS),
            required_classifiers: contributions.getPointContributionValues(TYPE_COLLECTION, entity, C_COLLECTION_REQUIRED_CLASSIFIERS),
            filter_by: getFilterByString(context, entity),
            
        };

        if (manual) {
            //if ReactTable works in server-side mode page and pageeSize should be sent to server
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
            return getCollection(context, resource, wsid, doProps)
                .then((response) => {
                    const { data, resolvedData, Data } = response;

                    this.resolvedData = this.data = this.classifiers = undefined;
                    
                    this.resolvedData = resolvedData || {};
                    this.data = data || {};

                    if (Data && typeof Data === "object") {
                        this.classifiers = _.get(Data, "classifiers");
                        let t = _.get(Data, "meta.total");

                        if (t && t > 0 && pageSize > 0) {
                            this.total = parseInt(t);
                            this.pages = Math.ceil(t / pageSize);
                        } else {
                            this.pages = 0;
                        }
                    }

                    return {
                        changedData: {
                            list: this.list()
                        }
                    };
                })
                .catch((e) => {
                    this.error(e)
                    this.pages = -1;
                    this.data = [];

                    return {
                        changedData: {
                            list: this.list()
                        }
                    };
                });
        } catch (e) {
            console.error(e);
            this.error(e.toString());
        }
    }

    buildData(items) {
        let data = [];
        const { showDeleted } = this;

        if (items && _.size(items) > 0) {
            if (!showDeleted) {
                _.each(items, (o) => {
                    if (o.state === 1) data.push(o);
                });
            } else {
                data = _.map(items, o => o);
            }
        }

        return data;
    }

    list() {
        const {
            page,
            pageSize,
            pages,
            total,
            manual,
            data,
            resolvedData,
            classifiers,
            showDeleted,
            order
        } = this;

        return {
            page,
            pageSize,
            pages,
            total,
            manual,
            initialData: data,
            data: this.buildData(resolvedData),
            classifiers,
            showDeleted,
            order
        };
    }

    drop() {
        return { ...INITIAL_STATE };
    }

    detouch() {
        return {
            list: this.drop()
        };
    }
}

export default RenderEntityStep; 
