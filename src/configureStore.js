/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createLogger } from 'redux-logger'
import thunkMiddleware from 'redux-thunk';
import { actionLogger } from './middleware';
import rootReducer from './reducers';

const persistConfigDefauult = {
    key: 'plugin',
    storage,
    blacklist: ['plugin', 'list', 'machine', 'options', 'context']
};

const loggerMiddleware = createLogger()

export default (persistConfig, initState = {}) => {
    let config = persistConfigDefauult;

    if (persistConfig && typeof persistConfig === 'object') {
        config = { ...config, persistConfig };
    }

    const persistedReducer = persistReducer(config, rootReducer);

    let middleware = [ thunkMiddleware ];

    if (process.env.NODE_ENV !== 'production') {
        middleware.push(loggerMiddleware);
        middleware.push(actionLogger);
    }
    
    const store = createStore(
        persistedReducer,
        initState,
        applyMiddleware(...middleware)
    );

    const persistor = persistStore(store);

    return { store, persistor };
};
