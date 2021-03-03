/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

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
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
    setListShowDeleted
} from '../../actions/';

class EntityTablePlan extends Component {
    constructor(props) {
        super();

        this.state = {
            data: null,
            props: {}
        };

        this.handleAddAction = this.handleAddAction.bind(this);
        this.handleEditAction = this.handleEditAction.bind(this);
        this.handleDeleteAction = this.handleDeleteAction.bind(this);
        this.handleReduceAction = this.handleReduceAction.bind(this);
        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleShowDeletedChanged = this.handleShowDeletedChanged.bind(this);
    }

    componentDidMount() {
        const { data } = this.props;

        const props = this._prepareProps(); 

        this.setState({ data: this._buildData(data), props });

    }

    componentDidUpdate(oldProps) {
        const { data } = this.props;

        console.log("EntityTablePlan.componentDidUpdate()");

        if (!isEqual(oldProps.data, data)) {

            console.log("Data is not equal! Building new data: ", oldProps.data, data);

            this.setState({
                data: this._buildData(data)
            });
        }
    }

    _prepareProps() {
        const { entity } = this.props;

        console.log("table props entity!!!", entity);
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
        const { locations } = this.props;

        this.props.sendNeedEditFormMessage(null, locations);
    }

    handleEditAction(entity) {
        const { locations } = this.props;
        
        if (_.isPlainObject(entity)) {
            this.props.sendNeedEditFormMessage([entity], locations);
        }
    }

    handleReduceAction(entity) {
        if (_.isPlainObject(entity)) {
            this.props.sendNeedReduceMessage([entity]);
        }
    }

    handleDeleteAction(entity) {
        if (_.isPlainObject(entity)) {
            this.props.sendNeedRemoveMessage([entity]);
        }
    }

    handleShowDeletedChanged(value) {
        this.props.setListShowDeleted(!!value);
    }

    renderHeader() {
        const { entity, contributions } = this.props;

        if (entity) {
            return funcOrString(contributions.getPointContributionValue('entities', entity, 'name'));
        }

        return t("Table plan", 'list');
    }

    renderPlans() {
        const { locations, locationsOptions, showDeleted } = this.props;
        const { data } = this.state;

        console.log('EntityTablePlan.renderPlans(): ', data);

        if (_.isEmpty(locations)) {
            return <Empty description={t("No locations selected", "tableplan")} />;
        }

        return _.map(locations, (locId) => {
            return  <TablePlan
                        key={`table_plan_${locId}`}
                        location={locId}
                        name={locationsOptions[locId]}
                        data={data ? data[locId] : null}
                        showDeleted={showDeleted}
                        onAdd={this.handleAddAction}
                        onEdit={this.handleEditAction}
                        onDelete={this.handleDeleteAction}
                        onReduce={this.handleReduceAction}
                        onShowDeletedChanged={this.handleShowDeletedChanged}
                    />;
        });
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
    const { initialData: data, showDeleted } = list;

    return {
        api,
        contributions,
        data,
        locations,
        locationsOptions,
        showDeleted
    };
};

export default connect(mapStateToProps, {
    sendCancelMessage,
    sendNeedEditFormMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
    setListShowDeleted,
})(withStackEvents(EntityTablePlan));
