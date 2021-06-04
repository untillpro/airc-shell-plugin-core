import _ from 'lodash';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Empty } from 'antd';
import DashboardGroup from './DashboardGroup';
import { LoadingOverlay } from '../common';

import {
    sendNeedRefreshDataMessage,
} from '../../actions';

class DashboardBuilder extends PureComponent {
    componentDidUpdate(oldProps) {
        const { from, to } = this.props;

        if (!from.isSame(oldProps.from) || !to.isSame(oldProps.to)) {
            this.props.sendNeedRefreshDataMessage();
        }
    }

    renderNoChart() {
        return (
            <div className="empty-charts-list">
                <Empty description="No charts contributions specified" />
            </div>
        );
    }

    renderCharts() {
        const { groups, data, visibility } = this.props;

        return _.map(groups, (items, index) => <DashboardGroup
            visibility={visibility}
            key={`group_${index}`}
            items={items}
            index={index}
            data={data}
        />);
    }
    
    render() {
        const { groups, loading } = this.props;

        if (_.isNil(groups) || _.size(groups) === 0) {
            return this.renderNoChart()
        }

        return (
            <div className="dashboard-container">
                {this.renderCharts()}
                <LoadingOverlay show={loading} />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { loading, data, customOrder, visibility, from, to } = state.dashboards;

    return {
        loading,
        customOrder,
        data,
        visibility,
        from,
        to
    };
}

const mapDispatchToProps = { sendNeedRefreshDataMessage };

export default connect(mapStateToProps, mapDispatchToProps)(DashboardBuilder);
