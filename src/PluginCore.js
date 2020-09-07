/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import React, { Component } from 'react';
import moment from 'moment';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import MainController from './components/system/MainController';
import ApiProvider from './components/system/ApiProvider';
import AppLoared from './components/system/AppLoared';

import configureStore from './configureStore';

import { StateMachineProvider, ErrorBoundary } from './components/';
import ContributionFactory from './classes/contributions/Factory';

//css

import 'antd/dist/antd.css';
import './base/css/untill-base.css';
import './base/css/antd_custom.css';
import './assets/css/main.css';
import './assets/css/confirm-alert.css';
import './assets/css/ticket.css';

//import 'moment/locale/uk';

class PluginCore extends Component {
    shouldComponentUpdate() {
        return false;
    }

    _init() {
        moment.locale('en');
        console.log('current moment locale is: ', moment.locale());
    }

    render() {
        const { contributions, persistConfig } = this.props;

        let manager = ContributionFactory(contributions);

        const cfg = configureStore(persistConfig, { "context": { "contributions": manager } });

        this._init();

        return (
            <Provider store={cfg.store} >
                <PersistGate
                    loading={null}
                    persistor={cfg.persistor}
                >
                    <ApiProvider>
                        <StateMachineProvider>
                            <ErrorBoundary>
                                <MainController />
                            </ErrorBoundary>
                        </StateMachineProvider>

                        <AppLoared />
                    </ApiProvider>
                </PersistGate>
            </Provider>
        );
    }
}

export default PluginCore;
