import {
    SELECT_REPORT_TYPE_MESSAGE,
    SEND_DO_GENERATE_REPORT_MESSAGE,
    SELECT_DATETIME_FILTER_PERIOD,
    SET_REPORTS_DATETIME_FILTER
} from './Types';

export const selectReportType = (code) => {
    console.log(`Selected report is ${code}`);

    return {
        type: SELECT_REPORT_TYPE_MESSAGE,
        payload: code
    };
};

export const sendDoGenerateReport = (reportType, from, to, filterBy, props) => {
    return {
        type: SEND_DO_GENERATE_REPORT_MESSAGE,
        payload: {
            report: reportType,
            from, 
            to, 
            filterBy,
            props
        }
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