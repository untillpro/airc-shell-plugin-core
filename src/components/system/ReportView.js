/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import RListHeader from '../report/RListHeader';
import RListTable from '../report/RListTable';

import { HeaderBackButton } from '../common';

//import { Search } from 'airc-shell-core';

import {
    sendCancelMessage,
    sendDoGenerateReport
} from '../../actions';

import {
    TYPE_REPORTS,
    C_REPORT_NAME,
    C_REPORT_COMPLEX,
    C_REPORT_COMPLEX_TYPE
} from '../../classes/contributions/Types';

import { 
    funcOrString
} from '../../classes/helpers';

class ReportView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchStr: "",
            props: {},
            isComplex: false,
            reportTypes: [],
        };

        this.handleCancelClick = this.handleCancelClick.bind(this);
    }

    componentDidMount() {
        const { report, contributions } = this.props;

        const isComplex = contributions.getPointContributionValue(TYPE_REPORTS, report, C_REPORT_COMPLEX);

        if (isComplex) {
            const types = contributions.getPointContributionValues(TYPE_REPORTS, report, C_REPORT_COMPLEX_TYPE);

            this.setState({
                isComplex: true,
                reportTypes: types
            });
        } else {
            this.setState({
                reportTypes: [report]
            })
        }

        this.props.sendDoGenerateReport();
    }

    handleCancelClick() {
        this.props.sendCancelMessage()
    }

    renderEntityName() {
        const { report, contributions } = this.props;

        const name = funcOrString(contributions.getPointContributionValue(TYPE_REPORTS, report, C_REPORT_NAME));

        if (name) {
            return name;
        }

        return '<Noname>'; //todo default name.
    }

    render() {
        const { data, loading, reportProps, contributions } = this.props;
        const { reportTypes, isComplex } = this.state;
        const { show_total } = reportProps;

        return (
            <>
                <div className='content-container'>
                    <div className="content-header">
                        <div className="grid col-2 row-1">
                            <div className="cell">
                                <HeaderBackButton
                                    onClick={this.handleCancelClick}
                                />
                                <h1>{this.renderEntityName()}</h1>
                            </div>

                            {
                                /*
                                    <div className="cell align-right">
                                        <Search defaultValue={searchStr}/>
                                    </div>
                                */
                            }
                        </div>
                    </div>
                </div>

                <div className='content-container'>
                    <RListHeader />
                    {_.map(reportTypes, (report) => {
                        return (
                            <>
                                <RListTable
                                    showTitle={isComplex}
                                    reportProps={reportProps}
                                    contributions={contributions}
                                    report={report}
                                    loading={loading}
                                    data={data || []}
                                    showTotal={show_total === 1}
                                />
                            </>
                        );
                    })}
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    const { loading, reportType: report, reportData: data, props: reportProps } = state.reports;
    const { contributions } = state.context;

    return {
        loading,
        report,
        data,
        contributions,
        reportProps
    };
}

const mapDispatchToProps = {
    sendCancelMessage,
    sendDoGenerateReport
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportView);