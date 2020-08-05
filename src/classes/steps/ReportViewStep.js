import _ from 'lodash';
import StateMachineStep from '../StateMachineStep';

import { isValidReport } from '../helpers/ReportsHelpers';
import { 
    TYPE_REPORTS, 
    C_REPORT_GENERATOR,
    C_REPORT_EVENT_TYPE 
} from '../contributions/Const';

import { MessageNotify } from '../messages'; 

class ReportViewStep extends StateMachineStep {
    constructor(...args) {
        super(args);

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
        const { report, filterBy, props, from, to } = msg;

        if (!isValidReport(context, report)) {
            return null;
        }

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
        const { contributions } = context;
        const { fromDateTime, toDateTime, props } = this;

        let reportData = null;

        const Data = await this.fetchData(context);
        
        if (Data && _.size(Data) > 0) {
            let generator = contributions.getPointContributionValue(TYPE_REPORTS, this.reportType, C_REPORT_GENERATOR);

            reportData = generator(Data, { ...props, fromDateTime, toDateTime});
        }

        if (!reportData || !_.isArray(reportData)) {
            reportData = [];
        }

        return {
            changedData: {
                reportData, 
                fetchingData: false
            }
        };
    }

    async MessageDateFilterChanged(msg, context) {
        // TODO 
    }

    async fetchData(context) {
        const { contributions, api, state } = context;
        const { locations } = state;
        const { 
            reportType: type, 
            fromDateTime: from, 
            toDateTime: to, 
            filterBy: filter,
        } = this;

        let event_type = contributions.getPointContributionValue(TYPE_REPORTS, type, C_REPORT_EVENT_TYPE);
        
        const props = { 
            type: event_type, 
            from, 
            to, 
            filter,
            show: true,
            from_offset: 0, // mock
            to_offset: 1000000 // mock
        };

        console.log('ReportViewStep.fetchData props', props);

        return api.log(locations, props)
            .then((res) => { 
                console.log('ReportViewStep.fetchData res', res);

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