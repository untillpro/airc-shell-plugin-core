/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import {
    ADD_TO_CONTEXT
} from '../actions/Types';

const INITIAL_STATE = {
    manager: null,
    api: null
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ADD_TO_CONTEXT:
            const { key, value } = action.payload;

            if (key && typeof key === 'string' && value !== undefined) {
                return {
                    ...state,
                    [key]: value
                };

            } else if (_.isPlainObject(action.payload)) {
                return {
                    ...state,
                    ...action.payload
                }
            }

            return state;

        default: return state
    }
};