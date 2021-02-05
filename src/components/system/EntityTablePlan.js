import _ from 'lodash';
import React, { Component } from 'react';
import { translate as t, Empty } from 'airc-shell-core';
import { connect } from 'react-redux';
import { withStackEvents } from 'stack-events';
import { Search } from 'airc-shell-core';
import { HeaderBackButton, TablePlan } from '../common/';
import { funcOrString } from '../../classes/helpers';
import isEqual from 'react-fast-compare';

import {
    sendCancelMessage,
    sendNeedEditFormMessage,
    sendNeedCopyFormMessage,
    sendNeedUnifyFormMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
} from '../../actions/';

class EntityTablePlan extends Component {
    constructor(props) {
        super();

        this.state = {
            data: null
        };

        this.handleAddAction = this.handleAddAction.bind(this);
        this.handleEditAction = this.handleEditAction.bind(this);
        this.handleDeleteAction = this.handleDeleteAction.bind(this);
        this.handleHideAction = this.handleHideAction.bind(this);
        this.handleBackClick = this.handleBackClick.bind(this);
    }

    componentDidMount() {
        const { data } = this.props;

        this.setState({ data: this._buildData(data) });
    }

    componentDidUpdate(oldProps) {
        const { data } = this.props;

        if (!isEqual(oldProps.data, data)) {
            this.setState({
                data: this._buildData(data)
            });
        }
    }

    _buildData(data) {
        const res = {};

        if (_.isPlainObject(data) && !_.isEmpty(data)) {
            _.forEach(data, (locations, name) => {
                if (!_.isEmpty(locations)) {
                    _.forEach(locations, (item, locId) => {
                        _.set(res, [locId, name], item);
                    });
                }
            });
        }

        return res;
    }

    handleBackClick() {
        this.props.sendCancelMessage();
    }

    handleAddAction() {
        this.props.sendNeedEditFormMessage(null);
    }

    handleEditAction(entity) {
        if (_.isPlainObject(entity)) {
            this.props.sendNeedEditFormMessage([entity]);
        }
    }

    handleDeleteAction(entity) {
        if (_.isPlainObject(entity)) {
            this.props.sendNeedRemoveMessage([entity]);
        }
    }

    handleHideAction(entity) {
        console.error('TODO: implement handleHideAction() method')
    }

    renderHeader() {
        const { entity, contributions } = this.props;

        if (entity) {
            return funcOrString(contributions.getPointContributionValue('entities', entity, 'name'));
        }

        return '<Noname>'; //todo default name.
    }

    renderPlans() {
        const { locations, locationsOptions } = this.props;
        const { data } = this.state;

        console.log('EntityTablePlan.renderPlans(): ', data);

        if (_.isEmpty(locations)) {
            return <Empty description={t("No locations selected", "tableplan")} />;
        }

        return _.map([1,2,3], (locId) => {
            return <TablePlan
                key={`table_plan_${locId}`}
                location={locId}
                name={locationsOptions[locId]}
                data={data ? data[locId] : null}
                onAdd={this.handleAddAction}
                onEdit={this.handleEditAction}
                onDelete={this.handleDeleteAction}
                onHide={this.handleHideAction}
            />;
        })
    }

    render() {
        return (
            <div className='content-container'>
                <div className="content-header">
                    <div className="grid clo-2 row-1">
                        <div className="cell">
                            <HeaderBackButton
                                onClick={this.handleBackClick}
                            />
                            <h1>{this.renderHeader()}</h1>
                        </div>

                        <div className="cell align-right">
                            <Search
                                onChange={this.handleSearchChange}
                            />
                        </div>
                    </div>
                </div>

                {this.renderPlans()}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { contributions, api } = state.context;
    const { list } = state.plugin;
    const { locations, locationsOptions } = state.locations;
    const { initialData: data } = list;

    return {
        api,
        contributions,
        data,
        locations,
        locationsOptions
    };
};

export default connect(mapStateToProps, {
    sendCancelMessage,
    sendNeedEditFormMessage,
    sendNeedCopyFormMessage,
    sendNeedUnifyFormMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
})(withStackEvents(EntityTablePlan));
