/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    ADD_TO_CONTEXT
} from './Types';

export const setContext = (key, value) => {
    return {
        type: ADD_TO_CONTEXT,
        payload: {
            key, 
            value
        }
    };
}

export const mergeContext = (data) => {
    return {
        type: ADD_TO_CONTEXT,
        payload: data
    }
}