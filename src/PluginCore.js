/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import React, { Component } from 'react';
import moment from 'moment';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StackEvents } from 'stack-events';
import { CoreProvider } from 'airc-shell-core';

import { StateMachineProvider, ErrorBoundary, AppLoared, ApiProvider, MainController } from './components/';

import { ContributionFactory } from './classes/';

import configureStore from './configureStore';

//css

import './assets/css/main.css';
import './assets/css/confirm-alert.css';
import './assets/css/ticket.css';

//import 'moment/locale/uk';

class PluginCore extends Component {
    shouldComponentUpdate() {
        return false;
    }

    _init() {
        // TODO l10n
        moment.locale('en');
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
                    <StackEvents events={[ "keydown" ]}>
                        <CoreProvider>
                            <ApiProvider>
                                <StateMachineProvider>
                                    <ErrorBoundary>
                                        <MainController />
                                    </ErrorBoundary>
                                </StateMachineProvider>
                                <AppLoared />
                            </ApiProvider>
                        </CoreProvider>
                    </StackEvents>
                </PersistGate>
            </Provider>
        );
    }
}

export default PluginCore;
