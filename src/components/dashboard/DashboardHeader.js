/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { 
    dashboardFrom, 
    dashboardTo, 
    dashboardVisibility
 } from '../../selectors';

import {
    Button,
    Tooltip,
    Modal,
    Checkbox,
    Divider,
    InputNumber,
    DatePicker,
    Row,
    Col,
    Form,
} from 'antd';

import LocationSelector from '../common/LocationSelector';

import {
    sendNeedRefreshDataMessage,
    setDashboardSettings
} from '../../actions';

import { 
    SettingOutlined,
    ReloadOutlined
 } from '@ant-design/icons';

/**
 * What todo:
 * - Charts visibility form
 * - date period selector
 * - save chages action
 */

const rangeConfig = {
    rules: [
        {
            type: 'array',
            //required: true,
            message: 'Please select period!',
        },
    ],
};

const formTailLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 20 },
};

const formItemLayout = {
    labelCol: {
        span: 7,
    },
    wrapperCol: {
        span: 20,
    },
};

class DashboardHeader extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            charts: [],
            opened: false
        };

        this.formRef = React.createRef();
    }

    componentDidMount() {
        //todo: init charts
    }

    openSettings = () => {
        this.setState({ opened: true });
    }

    doDashboardsRefresh = () => {
        this.props.sendNeedRefreshDataMessage();
    }

    handleOk = () => {
        this.formRef.current.submit();
        this.setState({ opened: false });
    }

    handleCancel = () => {
        this.setState({ opened: false });
    }

    onFinish = (data) => {
        const { charts, period, auto_refresh, refresh_delay } = data;
        const visibility = {};

        if (this.props.charts) {
            _.forEach(this.props.charts, (c) => {
                if (charts.indexOf(c.code) === -1) {
                    visibility[c.code] = false;
                }
            });
        }

        const payload = {
            visibility,
            from: period ? period[0] : null,
            to: period ? period[1] : null,
            autoRefresh: !!auto_refresh,
            refreshDelay: refresh_delay
        };

        this.props.setDashboardSettings(payload);
    }

    onFinishFailed = (data) => {
        console.log("onFinishFailed data: ", data.values);
    }

    getVisibleCharts() {
        const { charts, visibility } = this.props;
        const result = [];

        if (charts) {
            _.forEach(charts, (chart) => {
                if (visibility[chart.code] !== false) {
                    result.push(chart.code);
                }
            });
        }

        return result;
    }

    render() {
        const { charts, from, to, autoRefresh, refreshDelay } = this.props;
        const { opened } = this.state;

        return (
            <div className="dashboard-header">
                <div className="_location">
                    <LocationSelector />
                </div>

                <div className="_title">
                    HOME PAGE {from.format("YYYY/MM/DD HH:mm")} - {to.format("YYYY/MM/DD HH:mm")}
                </div>

                <div className="_actions">
                    <Tooltip title="Settings">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<SettingOutlined />}
                            onClick={this.openSettings}
                        />
                    </Tooltip>

                    <Tooltip title="Settings">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<ReloadOutlined />}
                            onClick={this.doDashboardsRefresh}
                        />
                    </Tooltip>
                </div>

                {opened ? (
                    <Modal
                        title="Settings"
                        visible={true}

                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                    >
                        <div className="dashboards-header-settings">
                            <Form
                                {...formItemLayout}
                                ref={this.formRef}
                                onFinish={this.onFinish}
                                onFinishFailed={this.onFinishFailed}
                                initialValues={{
                                    "period": [from, to],
                                    "auto_refresh": autoRefresh,
                                    "refresh_delay": refreshDelay,
                                    "charts": this.getVisibleCharts()
                                }}
                            >
                                <Form.Item name="period" label="Date period" {...rangeConfig}>
                                    <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm" />
                                </Form.Item>


                                <Form.Item name="charts" label="Charts">
                                    <Checkbox.Group>
                                        {_.map(charts, (c) => {
                                            return (
                                                <Row>
                                                    <Checkbox value={c.code} checked={true}>{c.name}</Checkbox>
                                                </Row>
                                            );
                                        })}
                                    </Checkbox.Group>
                                </Form.Item>
                                <Divider />
                                <Row>
                                    <Col span={8}>
                                        <Form.Item {...formTailLayout} name="auto_refresh" valuePropName="checked">
                                            <Checkbox>Auto-refresh</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={10}>
                                        <Form.Item {...formTailLayout} name="refresh_delay">
                                            <InputNumber />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4} style={{ textAlign: "left" }}>sec.</Col>
                                </Row>
                            </Form>
                        </div>
                    </Modal>
                ) : null}
            </div>
        );
    }
}

DashboardHeader.propTypes = {
    contributions: PropTypes.object.isRequired,
    from: PropTypes.object,
    to: PropTypes.object,
    visibility: PropTypes.object
};

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const { autoRefresh, refreshDelay } = state.dashboards;

    return {
        contributions,
        from: dashboardFrom(state),
        to: dashboardTo(state),
        visibility: dashboardVisibility(state),
        autoRefresh,
        refreshDelay,
    };
};

const mapDispatchToProps = {
    setDashboardSettings,
    sendNeedRefreshDataMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardHeader);