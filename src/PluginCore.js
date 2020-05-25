/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import MainController from './components/system/MainController';
import ApiProvider from './components/system/ApiProvider';
import AppLoared from './components/system/AppLoared';

import configureStore from './configureStore';

import ContributionsContext from './context/ContributionsContext';

import { StateMachineProvider, ErrorBoundary } from './components/';
import ContributionFactory from './classes/contributions/Factory';

//css

import 'antd/dist/antd.css';
import './base/css/untill-base.css';
import './base/css/antd_custom.css';
import './assets/css/main.css';
import './assets/css/confirm-alert.css';
import './assets/css/ticket.css';


class PluginCore extends Component {
    render() {
        const { contributions } = this.props;

        if (!contributions || _.size(contributions) <= 0) {
            throw new Error("No contributions were provided to Plugin Core");
        }

        const cfg = configureStore();
        const manager = ContributionFactory(contributions);
        
        return (
            <Provider store={cfg.store}>
                <PersistGate 
                    loading={null} 
                    persistor={cfg.persistor}
                >   
                    <ApiProvider>
                        <StateMachineProvider manager={manager}>
                            <ContributionsContext.Provider value={manager}>
                                <ErrorBoundary>
                                    <MainController />
                                </ErrorBoundary>
                            </ContributionsContext.Provider>
                        </StateMachineProvider>
                        <AppLoared />
                    </ApiProvider>
                </PersistGate>
            </Provider>
        );
    }
}

export default PluginCore;
