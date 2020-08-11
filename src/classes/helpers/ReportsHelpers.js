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

export const getDatetimePeriods = (contributions, mostUsedPeriods) => {
    let periods = [];
    let allPeriods = {};

    if (contributions) {
        const groups = contributions.getPoints("periods_groups");

        _.forEach(groups, (groupCode) => {
            let groupPoint = contributions.getPoint("periods_groups", groupCode)

            if (!groupPoint) return;

            let g = {
                name: groupPoint.getContributuionValue("name"),
                code: groupCode,
                order: groupPoint.getContributuionValue("order"),
                periods: []
            }

            let p = groupPoint.getContributuionValue("periods", true);

            if (p && _.isArray(p) && p.length > 0) {
                _.forEach(p, (periodCode) => {
                    let periodPoint = contributions.getPoint("periods", periodCode)

                    if (!periodPoint) return;

                    let period = {
                        code: periodCode,
                        name: periodPoint.getContributuionValue("name"),
                        from: periodPoint.getContributuionValue("from"),
                        to: periodPoint.getContributuionValue("to")
                    };

                    allPeriods[periodCode] = period;
                    g.periods.push(period);
                });
            }

            periods.push(g);
        });

    }

    let mostUsedGroup = generateMostUsedPeriods(allPeriods, mostUsedPeriods);

    if (mostUsedGroup) {
        periods.push(mostUsedGroup);
    }

    periods = _.sortBy(periods, (o) => o.order);

    return periods;
}

const generateMostUsedPeriods = (allPeriods, mostUsedPeriods) => {
    let periods = [];
    let group = null;

    if (allPeriods && _.size(allPeriods) > 0 && mostUsedPeriods && _.size(mostUsedPeriods) > 0) {
        let pairs = _.toPairs(mostUsedPeriods)
        let p = _.sortBy(pairs, (o) => o[1]).reverse();

        p.forEach(([code, count]) => {
            if (allPeriods[code]) {
                periods.push(allPeriods[code]);
            }
        });
    }

    if (periods.length > 0) {
        group = {
            code: "most_used",
            name: "Most used",
            order: 0,
            periods
        }
    }

    return group;
}
