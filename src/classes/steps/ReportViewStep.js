/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import StateMachineStep from '../StateMachineStep';

import { isValidReport, isValidLocations, prepareReportFilter } from '../helpers';
import { 
    TYPE_REPORTS, 
    C_REPORT_REQUIRED_CLASSIFIERS,
    C_REPORT_EVENT_TYPE 
} from '../contributions/Types';

import { MessageNotify } from '../messages'; 

class ReportViewStep extends StateMachineStep {
    constructor(...args) {
        super(args);

        this.locations = [];
        this.reportType = null;
        this.fromDateTime = null;
        this.toDateTime = null;
        this.filterBy = {};
        this.props = {};
    }

    getName() {
        return 'ReportViewStep';
    }

    async MessageInit(msg, context) {
        const { report, locations, filterBy, props, from, to } = msg;

        if (!isValidReport(context, report)) {
            throw new Error(this.getName() + '.MessageInit() exception: report not specified or wrong given: ' + report);
        }

        if (!isValidLocations(locations)) {
            throw new Error(this.getName() + '.MessageInit() exception: locations not specified or wrong given: ' + locations.toString())
        }

        this.locations = locations;
        this.reportType = report;

        if (filterBy && _.isPlainObject(filterBy)) {
            this.filterBy = filterBy;
        } else {
            this.filterBy = {};
        }

        if (props && _.isPlainObject(props)) {
            this.props = props;
        } else {
            this.props = {};
        }

        if (from && _.isNumber(from)) {
            this.fromDateTime = from;
        }

        if (to && _.isNumber(to)) {
            this.toDateTime = to;
        }

        return {
            changedData: {
                fetchingData: true,
                reportData: null
            }
        };
    }

    async MessageGenerateReport(msg, context) {
        //const { contributions } = context;
        const { report, filterBy, props, from, to } = msg;

        if (report && typeof report === 'string') {
            this.reportType = report;
        }

        if (filterBy && _.isPlainObject(filterBy)) {
            this.filterBy = filterBy;
        }

        if (props && _.isPlainObject(props)) {
            this.props = props;
        }
        if (from && _.isNumber(from)) {
            this.fromDateTime = from;
        }

        if (to && _.isNumber(to)) {
            this.toDateTime = to;
        }

        //const { fromDateTime, toDateTime } = this;

        const Data = await this.fetchReportData(context);
        
        return {
            changedData: {
                reportData: Data || {}, 
                fetchingData: false
            }
        };
    }

    async MessageDateFilterChanged(msg, context) {
        // TODO 
    }

    async fetchReportData(context) {
        const { locations } = this;
        const { contributions, api } = context;

        const { 
            reportType: type, 
            fromDateTime: from, 
            toDateTime: to, 
            filterBy,
        } = this;

        let event_type = contributions.getPointContributionValues(TYPE_REPORTS, type, C_REPORT_EVENT_TYPE);

        const props = { 
            type: event_type, 
            from, 
            to, 
            show: true,
            from_offset: 0, // mock
            to_offset: 1000000,// mock
            required_classifiers: contributions.getPointContributionValues(TYPE_REPORTS, type, C_REPORT_REQUIRED_CLASSIFIERS)
        };

        if (filterBy && _.isPlainObject(filterBy)) {
            const filterProps = prepareReportFilter(context, type, filterBy);

            if (filterProps && _.size(filterProps) > 0) {
                props["filterBy"] = filterProps;
            }
        }

        return api.log(locations, props)
            .then((res) => { 
                // mock result due to absent of ../report/ function        // TODO remove in isProduction
                const mockResult = this._mock(locations, res);
                // dont forget to remove this after real ../report/ func become available

                return mockResult;
            })
            .catch((err) => this.error(err.toString()));
    }

    MessageCancel() {
        return {
            pop: true,
            message: new MessageNotify()
        };
    }

    _mock(locations, Data) {
        const { classifiers = {}, events = {} } = Data;
        const result = {};

        if (locations && _.isArray(locations)) {
            _.forEach(locations, (loc) => {
                result[loc] = {
                    events,
                    classifiers: classifiers[loc]
                }
            })
        } else if (locations && _.isNumber(locations)) {
            result[locations] = {
                events,
                classifiers: classifiers[locations]
            }
        }

        return result;
    }
}

export default ReportViewStep;