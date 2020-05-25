/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Keypress from 'react-keypress';

import RootRenderer from './RootRenderer';
import ViewRenderer from './ViewRenderer';
import EntityRenderer from './EntityRenderer';
import EntityEditor from './EntityEditor';

import ContributionsContext from '../../context/ContributionsContext';

import log from '../../classes/Log';
import { initBO, toggleLocationSelector } from '../../actions/';

// import { ViewsGrid } from 'components';

// import * as EntityManagers from 'contributors/entityManagers';
// import * as Views from 'contributors/applicationViews';

class MainController extends Component {

    constructor(props) {
        super(props);

        this.state = {
            errorCatched: false,
            error: null
        };
    }

    componentDidMount() {
        this.props.initBO();
        
        window.addEventListener('keydown', Keypress("shift a",() => {
            this.props.toggleLocationSelector();
        }));
    }

    renderStateComponent(context) {
        const { step } = this.props;

        log(`%cCurrent step is: ${step}`, 'color: #e83f6f ; font-size: 140%; font-weight: bold;');

        if (step) {
            switch (step) {
                case 'EntityEditStep':
                    // when creating or editing entity item
                    return <EntityEditor contributions={context} />;
                case 'EntityMassEditStep':
                    // when mass editing entity items
                    return <EntityEditor contributions={context} massedit />;
                case 'RenderEntityStep': 
                    // when select an entity manager
                    return <EntityRenderer contributions={context} />;
                case 'RenderViewStep': 
                    // when select a view
                    return <ViewRenderer contributions={context} />;
                default: 
                    return <RootRenderer contributions={context} />;
            }
        }
        
        return null;
    }

    render() {
        const { errorCatched, error } = this.state;

        if (errorCatched) {
            return (
                <div>
                    {error.toString()}
                </div>
            );
        }

        return (
            <div className='page-content'>
                <ContributionsContext.Consumer>
                    {(context) => this.renderStateComponent(context)}
                </ContributionsContext.Consumer>

                <div className="plugin-version">
                    {process.env.REACT_APP_NAME}: {process.env.REACT_APP_VERSION}
                </div>
            </div>
        );
    }
}

MainController.propTypes = {
    step: PropTypes.string
    // view: PropTypes.string, 
    // entity: PropTypes.string
};

const mapStateToProps = (state) => {
    const { step } = state.bo;
    
    return { step };
};

export default connect(mapStateToProps, { initBO, toggleLocationSelector })(MainController);
