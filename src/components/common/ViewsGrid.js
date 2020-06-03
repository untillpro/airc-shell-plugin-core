/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Grid, Card, Message, LocationSelector } from '../../base/components';
import { sendSelectViewMessage, setLocation } from '../../actions';

import Logger from '../../base/classes/Logger';

import TestLocationSelector from './TestLocationSelector';

import * as Errors from '../../const/Errors';

class ViewsGrid extends Component {
    constructor(props) {
        super(props);

        this.setLocation = this.setLocation.bind(this);
    }
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

    setLocation(location) {
        if (location) {
            if (_.isArray(location)) {
                this.props.setLocation(location)
            } else if (_.isNumber(location)) {
                this.props.setLocation([location])
            } else {
                throw new Error(`Location should be an array of integers or a single integer`);
            }
        } else {
            throw new Error(`Wrong location number is given: ${location}`);
        }
    }

    getCurrentLocation() {
        const { selectedLocations } = this.props;

        if (selectedLocations && _.isArray(selectedLocations) && selectedLocations.length > 0) {
            return selectedLocations[0];
        } else if (_.isNumber(selectedLocations) && selectedLocations > 0) {
            return selectedLocations;
        }

        return null;
    }

    renderViewsGrid(views) {
        const { contributions, showSelector, locations } = this.props;
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
            const currentLocation = this.getCurrentLocation();

            _.sortBy(declarations, (o) => o.order);

            return (
                <div className={`content-container ${showSelector ? 'flex-content row' : ''}`}>
                    {showSelector ? <LocationSelector
                        locations={locations}
                        value={currentLocation}
                        title="Location: "
                        onChange={(location) => this.setLocation(location)}
                    /> : null}

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

            return (
                <Fragment>
                    <TestLocationSelector />
                    {this.renderViewsGrid(views)}
                </Fragment>
            );
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

const mapStateToProps = (state) => {
    const { locations: selectedLocations } = state.plugin;
    const { showLocationSelector: showSelector, locations } = state.options;

    return {
        showSelector,
        locations,
        selectedLocations
    };
};

ViewsGrid.propTypes = {
    sendSelectViewMessage: PropTypes.func,
    contributions: PropTypes.object
};

export default connect(mapStateToProps, { sendSelectViewMessage, setLocation })(ViewsGrid);
