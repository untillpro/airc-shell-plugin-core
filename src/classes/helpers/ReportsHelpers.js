import _ from 'lodash';

import {
    TYPE_REPORTS,
    C_REPORT_GENERATOR,
    C_REPORT_COLUMNS,
    C_REPORT_EVENT_TYPE
 } from '../contributions/Const';

export const isValidReport = (context, reportCode) => {
    const { contributions } = context;

    if (!reportCode || typeof reportCode !== 'string') {
        throw new Error(`wrong report code provided. Expected "string" but received "${typeof reportCode}"`);
    }

    // check for report contribution point
    let reportPoint = contributions.getPoint(TYPE_REPORTS, reportCode);

    if (!reportPoint) {
        throw new Error(`can't find report contribution with id "${reportCode}"`);
    }

    // check for data generator function
    let generator = reportPoint.getContributuionValue(C_REPORT_GENERATOR);

    if (!generator || !_.isFunction(generator)) {
        throw new Error(`generator function is null or wrong specified for report "${reportCode}"`);
    }

    // check for list columns defined
    let columns = reportPoint.getContributuionValue(C_REPORT_COLUMNS, true);
    
    if (!columns || !_.isArray(columns) || columns.length === 0) {
        throw new Error(`no list columns specified for report "${reportCode}". Expected array of objects.`);
    }

    let event_type = reportPoint.getContributuionValue(C_REPORT_EVENT_TYPE);

    if (!event_type || typeof event_type !== 'string') {
        throw new Error(`no event_type prop specified or wrong given for report ${reportCode}.`);
    }   

    return true;
}