/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Grid, Card, Message } from '../../base/components';
import { sendSelectViewMessage } from '../../actions';

import LocationSelector from './LocationSelector';

import Logger from '../../base/classes/Logger';

import * as Errors from '../../const/Errors';

class ViewsGrid extends Component {
    _checkDeclaration(declaration) {
        if (!declaration ||
            !_.isObject(declaration) ||
            !_.has(declaration, "name") ||
            !_.has(declaration, "code")) {
            return false;
        }

        return true;
    }

    onViewClick(view) {
        this.props.sendSelectViewMessage(view);
    }

    renderViewsGrid(views) {
        const { contributions } = this.props;
        const declarations = [];

        _.each(views, (view) => {
            const viewDeclaration = contributions.getPoint('views', view);

            const declare = {};

            declare.name = viewDeclaration.getContributuionValue('name');
            declare.code = viewDeclaration.getContributuionValue('code');
            declare.description = viewDeclaration.getContributuionValue('description');
            declare.ico = viewDeclaration.getContributuionValue('ico');
            declare.order = viewDeclaration.getContributuionValue('order');

            if (this._checkDeclaration(declare)) {
                declarations.push(declare);
            } else {
                Logger.log(viewDeclaration, `View "${view}" declaration malformed`, "ViewsGrid");
            }
        });

        if (declarations && declarations.length > 0) {
            _.sortBy(declarations, (o) => o.order);

            return (
                <div className='content-container'>
                    <LocationSelector />
                    <Grid
                        cols={3}
                        gap={32}
                    >
                        {
                            declarations.map((declarationInfo) => {
                                return (
                                    <Card
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
        const { contributions } = this.props;
        const views = contributions.getPoints('views');

        if (_.size(views) > 0) {
            return this.renderViewsGrid(views);
        }

        return (
            <div>
                <Message type='error' >
                    {Errors.VIEWS_NOT_SPECIFIED}
                </Message>
            </div>
        );
    }
}



ViewsGrid.propTypes = {
    sendSelectViewMessage: PropTypes.func,
    contributions: PropTypes.object
};

export default connect(null, { sendSelectViewMessage })(ViewsGrid);
