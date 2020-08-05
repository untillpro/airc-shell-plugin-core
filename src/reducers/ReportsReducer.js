/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import moment from 'moment';

import {
    SEND_STATE_MACHINE_DATA,
    SELECT_REPORT_TYPE_MESSAGE,
    SELECT_DATETIME_FILTER_PERIOD,
    SET_REPORTS_DATETIME_FILTER,
    SEND_DO_GENERATE_REPORT_MESSAGE
} from '../actions/Types';
import { mergeExisting } from '../classes/Utils';

const whfrominit = moment("2000-01-01 05:00");
const whtoinit = moment("2000-01-01 17:00");

const INITIAL_STATE = {
    reportType: null,
    fromDateTime: null,
    toDateTime: null,
    workingHoursFrom: whfrominit, // 5 * 3600 seconds
    workingHoursTo: whtoinit, // 17 * 3600 seconds
    filterBy: {},
    mostUsedPeriods: {},
    cashedFilterBy: {},
    reportData: []
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SEND_STATE_MACHINE_DATA:
            console.log("ReportReducer.SEND_STATE_MACHINE_DATA", action.payload);
            let t = mergeExisting(state, action.payload);

            console.log("State after merge: ", t);
            return t;

        case SELECT_REPORT_TYPE_MESSAGE: 
            if (action.payload && typeof action.payload === 'string') {
                let newState = { ...state, reportType: action.payload  };

                if (state.cashedFilterBy && 
                    state.cashedFilterBy[action.payload] && 
                    typeof state.cashedFilterBy[action.payload] === 'object'
                ) {
                    newState.filterBy = state.cashedFilterBy[action.payload]
                } else {
                    newState.filterBy = {}
                }

                return newState;
            }

            return state;

        case SELECT_DATETIME_FILTER_PERIOD:
            let code = action.payload;
            let temp = { ...state.mostUsedPeriods }

            if (!temp) {
                temp = {};
            }

            if (temp[code]) {
                temp[code]++
            } else {
                temp[code] = 1
            }

            return {
                ...state,
                mostUsedPeriods: temp
            };

        /*
            action.payload expected as plain object with keys "from" for "fromDateTime" value and "to" for "toDateTime";
        */
        case SET_REPORTS_DATETIME_FILTER: 
            if (_.isPlainObject(action.payload)) {
                const { from, to } = action.payload;

                let newState = {...state};

                if (from !== undefined ) {
                    if (_.isInteger(from) && from > 0) {
                        newState.fromDateTime = from;
                    } else {
                        newState.fromDateTime = null;
                    }
                }

                if (to !== undefined ) {
                    if (_.isInteger(to) && to > 0) {
                        newState.toDateTime = to;
                    } else {
                        newState.toDateTime = null;
                    }
                }

                return newState;
            }
            
            return state;
        
        case SEND_DO_GENERATE_REPORT_MESSAGE: 

            console.log('SEND_DO_GENERATE_REPORT_MESSAGE', action.payload );

            if (action.payload && typeof action.payload === 'object') {
                const { report, filterBy } = action.payload;
                const cash = state.cashedFilterBy ? { ...state.cashedFilterBy } : {};

                if (report && filterBy && typeof filterBy === 'object') {
                    cash[report] = filterBy;
                }

                return { ...state, cashedFilterBy: cash}
            }
            
            return state;

        default: return state;
    }
}