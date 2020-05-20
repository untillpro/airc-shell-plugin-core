/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { combineReducers } from 'redux';

import BoReducer from './BoReducer';
import StateMachineReducer from './StateMachineReducer';
import MessagesReducer from './MessagesReducer';
import AppOptions from './AppOptions';

export default combineReducers({
    bo: BoReducer,
    machine: StateMachineReducer,
    messages: MessagesReducer,
    options: AppOptions
});
