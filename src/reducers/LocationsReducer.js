/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import { 
    INIT_PLUGIN,
    SET_LOCATIONS 
} from '../actions/Types';

const INITIAL_STATE = {
    locations: [1],
    locationsOptions: {
        1: "UI Development",
        2: "Server Development",
        3: "QA",
        4: "Demo",
    },
}

const reducer = (state = INITIAL_STATE, action) => {
    const payload = action.payload || {};
    let newState = null;

    switch (action.type) {
        case INIT_PLUGIN: 
            newState = { ...state };

            if (_.isArray(payload.locations)) {
                newState.locations = payload.locations;
            }

            if (_.isPlainObject(payload.locationsOptions)) {
                newState.locationsOptions = payload.locationsOptions;
            }

            return newState;

        case SET_LOCATIONS:
            if (!_.isArray(payload) || payload.length <= 0) return state;

            return {
                ...state,
                locations: payload
            }

        default: return state;
    }
};

export default reducer;
