/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Button, DateTimeFilterModal } from '../../base/components/';

import {
    ReloadOutlined
} from '@ant-design/icons';

import { getDatetimePeriods } from '../../classes/helpers/ReportsHelpers';
import { sendDoGenerateReport } from '../../actions';

class RListHeader extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            periods: []
        };

        this.handleDateFilterChange = this.handleDateFilterChange.bind(this);
        this.handleRefreshPressed = this.handleRefreshPressed.bind(this);
    }

    componentDidMount() {
        const { contributions, mostUsedPeriods } = this.props;
        let periods = getDatetimePeriods(contributions, mostUsedPeriods);

        this.setState({ periods });
    }

    handleRefreshPressed() {
        this.props.sendDoGenerateReport();
    }

    handleDateFilterChange(values) {
        let from, to = null;

        if (values && _.isArray(values)) {
            from = values[0] || null;
            to = values[1] || null;
        }

        this.props.sendDoGenerateReport(null, from, to);
    }

    renderFilter() {
        const { periods } = this.state;
        const { fromDateTime, toDateTime, workingHoursFrom, workingHoursTo } = this.props;

        return (
            <div className='untill-base-table-header-togglers'>
                <DateTimeFilterModal
                    showCustom
                    periods={periods}

                    from={fromDateTime}
                    to={toDateTime}
                    fromTime={workingHoursFrom}
                    toTime={workingHoursTo}

                    format="DD/MM/YYYY HH:mm"

                    onChange={this.handleDateFilterChange}
                />
            </div>
        );
    }

    renderActions() {
        return (
            <div className='untill-base-table-header-actions'>
                <Button
                    icon={<ReloadOutlined />}
                    key='header-action-add'
                    onClick={this.handleRefreshPressed}
                />
            </div>
        );
    }

    render() {
        return (
            <div className='untill-base-table-header header-actions'>
                {this.renderFilter()}
                {this.renderActions()}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const {
        fromDateTime,
        toDateTime,
        workingHoursFrom,
        workingHoursTo,
        mostUsedPeriods
    } = state.reports;


    return {
        contributions,

        fromDateTime,
        toDateTime,
        workingHoursFrom,
        workingHoursTo,

        mostUsedPeriods
    };
};

export default connect(mapStateToProps, {
    sendDoGenerateReport
})(RListHeader);