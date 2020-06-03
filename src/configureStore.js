/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import ReduxThunk from 'redux-thunk';

import rootReducer from './reducers';
 
const persistConfigDefauult = {
    key: 'plugin',
    storage,
    blacklist: ['list', 'machine'] 
};
 
export default (persistConfig) => {
    let config = persistConfigDefauult;

    if (persistConfig && typeof persistConfig === 'object') {
        config = { ...config, persistConfig };
    }

    const persistedReducer = persistReducer(config, rootReducer);

    const store = createStore(persistedReducer, {}, applyMiddleware(ReduxThunk));
    const persistor = persistStore(store);
  
    return { store, persistor };
};
