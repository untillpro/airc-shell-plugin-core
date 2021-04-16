/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { 
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

    switch (action.type) {
        case SET_LOCATIONS:
            if (action.payload.length <= 0) return state;

            return {
                ...state,
                locations: action.payload
            }
        default: return state;
    }
};

export default reducer;
