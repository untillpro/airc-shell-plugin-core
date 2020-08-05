/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Keypress from 'react-keypress';

import RootRenderer from './RootRenderer';
import ViewRenderer from './ViewRenderer';
import EntityRenderer from './EntityRenderer';
import EntityEditor from './EntityEditor';

import ReportView from '../report/ReportView';

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

    renderStateComponent() {
        const { step } = this.props;

        log(`%cCurrent step is: ${step}`, 'color: #e83f6f ; font-size: 140%; font-weight: bold;');

        if (step) {
            switch (step) {
                case 'EntityEditStep':
                    // when creating or editing entity item
                    return <EntityEditor />;
                case 'EntityMassEditStep':
                    // when mass editing entity items
                    return <EntityEditor massedit />;
                case 'RenderEntityStep': 
                    // when select an entity manager
                    return <EntityRenderer />;
                case 'RenderViewStep': 
                    // when select a view
                    return <ViewRenderer />;
                case 'ReportViewStep': 
                    // when generate a report
                    return <ReportView />;
                default: 
                    return <RootRenderer />;
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
                {this.renderStateComponent()}

                <div className="plugin-version">
                    {process.env.REACT_APP_NAME}: {process.env.REACT_APP_VERSION}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { step } = state.plugin;
    
    return { step };
};

export default connect(mapStateToProps, { initBO, toggleLocationSelector })(MainController);
