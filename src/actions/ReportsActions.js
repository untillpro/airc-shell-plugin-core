/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    SELECT_REPORT_TYPE_MESSAGE,
    SELECT_DATETIME_FILTER_PERIOD,
    SET_REPORTS_DATETIME_FILTER
} from './Types';

import {
    SAGA_FETCH_REPORT
} from '../sagas/Types';

export const selectReportType = (code) => {
    return {
        type: SELECT_REPORT_TYPE_MESSAGE,
        payload: code
    };
};

//TODO - implment with saga
export const sendDoGenerateReport = (report, from, to, filterBy, props) => {
    return {
        type: SAGA_FETCH_REPORT,
        payload: { report, from, to, filterBy, props }
    };
};

export const selectFilterPeriod = (periodCode) => {
    return {
        type: SELECT_DATETIME_FILTER_PERIOD,
        payload: periodCode
    }
};

export const setDatetimeFilter = (values) => {
    return {
        type: SET_REPORTS_DATETIME_FILTER,
        payload: values
    };
}