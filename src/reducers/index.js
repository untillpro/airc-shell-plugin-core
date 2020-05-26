/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { combineReducers } from 'redux';

import PluginReducer from './PluginReducer';
import StateMachineReducer from './StateMachineReducer';
import MessagesReducer from './MessagesReducer';
import AppOptions from './AppOptions';

export default combineReducers({
    plugin: PluginReducer,
    machine: StateMachineReducer,
    messages: MessagesReducer,
    options: AppOptions
});
