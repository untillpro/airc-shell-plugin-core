/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Message, Grid, Card } from '../../base/components';

import {
    HeaderBackButton
} from '../common/';

import {
    sendSelectEntityMessage,
    sendCancelMessage,
} from '../../actions/';

class ViewEntityGrid extends Component {
    constructor() {
        super();
        
        this.state = {
            selectedEntity: null
        };
    }

    selectEntity(entity) {
        const { selectedEntity } = this.state;

        if (selectedEntity !== null) return;

        if (entity && typeof entity === 'string') {
            this.props.sendSelectEntityMessage(entity);
            this.setState({ selectedEntity: entity });
        }
    }

    renderHeader() {
        const { view, contributions } = this.props;

        let header = contributions.getPointContributionValue('views', view, 'name') || '';

        return (
            <div className="content-header">
                <div className="grid clo-2 row-1">
                    <div className="cell">
                        <HeaderBackButton 
                            onClick={() => this.props.sendCancelMessage()}
                        />
                        <h1>{header}</h1>
                    </div>
                </div>
                
            </div>
        );
    }

    renderEntitiesGrid(entities) {
        const { selectedEntity } = this.state;
        const { contributions } = this.props;

        const declarations = [];

        _.each(entities, (entityName) => {

            const entityManagerPoint = contributions.getPoint('entities', entityName);

            if (entityManagerPoint) {
                declarations.push({
                    "name": entityManagerPoint.getContributuionValue("name"),
                    "code": entityName,
                    "description": entityManagerPoint.getContributuionValue("description"),
                    "ico": entityManagerPoint.getContributuionValue("ico"),
                    "order": entityManagerPoint.getContributuionValue("order")
                });
            }
        });

        if (declarations.length > 0) {
            _.sortBy(declarations, (o) => o.order);

            return (
                <div className='content-container'>
                    {this.renderHeader()}
                    
                    <Grid 
                        cols={4} 
                        gap={24}
                    >
                        {
                            declarations.map((declarationInfo) => {
                                return (
                                    <Card 
                                        loading={declarationInfo.code === selectedEntity}
                                        type='small'
                                        align='center'
                                        valign='center'
                                        title={declarationInfo.name}
                                        text={declarationInfo.description}
                                        ico={declarationInfo.ico}
                                        key={declarationInfo.name}
                                        onClick={this.selectEntity.bind(this, declarationInfo.code)} 
                                    />
                                );
                            })
                        }
                    </Grid>
                </div>
            );
        }

        return null;
    }

    render() {
        const { view, contributions } = this.props;
        const viewPoint = contributions.getPointContributions('views', view);
        
        const entities = viewPoint.managers;

        if (entities  && entities.length > 0) {
            return this.renderEntitiesGrid(entities);
        }

        return (
            <Message type='error' >
                <p>
                    * TODO Write error text *
                </p>
            </Message>
        );
    }
}

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const { view } = state.plugin;

    return { view, contributions };
};

export default connect(mapStateToProps, { 
    sendSelectEntityMessage,
    sendCancelMessage
})(ViewEntityGrid);
