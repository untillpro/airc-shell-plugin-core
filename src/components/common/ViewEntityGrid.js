/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Message, Grid, Card } from 'base/components';

import {
    HeaderBackButton
} from 'components';

import {
    sendSelectEntityMessage,
    sendCancelMessage
} from 'actions';

import * as EntityManagers from 'contributors/entityManagers';

class ViewEntityGrid extends Component {
    onViewClick(entity) {
        this.props.sendSelectEntityMessage(entity);
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

    renderViewsGrid(entities) {
        const { contributions } = this.props;

        const declarations = [];

        _.each(entities, (entityName) => {

            const entityManagerPoint = contributions.getPoint('managers', entityName);

            if (entityManagerPoint) {
                const emClass = entityManagerPoint.getContributuionValue('class');

                if ( EntityManagers[emClass] ) {
                    const emc = new EntityManagers[emClass]();
                    const declarationInfo = emc.declare();

                    if (declarationInfo) {
                        declarationInfo.code = emc.getName();
                        declarations.push(declarationInfo);
                    }
                }
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
                                        type='small'
                                        align='center'
                                        valign='center'
                                        title={declarationInfo.name}
                                        text={declarationInfo.description}
                                        ico={declarationInfo.ico}
                                        key={declarationInfo.name}
                                        onClick={() => this.onViewClick(declarationInfo.code)} 
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
        
        const EMViews = viewPoint.managers;

        if (EMViews  && EMViews.length > 0) {
            return this.renderViewsGrid(EMViews);
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

ViewEntityGrid.propTypes = {
    sendSelectEntityMessage: PropTypes.func,
    view: PropTypes.string,
    contributions: PropTypes.object
};

const mapStateToProps = (state) => {
    const { view } = state.bo;

    return { view };
};

export default connect(mapStateToProps, { 
    sendSelectEntityMessage,
    sendCancelMessage
})(ViewEntityGrid);
