/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { 
    SET_LOCAIOTNS 
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

export default (state = INITIAL_STATE, action) => {

    switch (action.type) {
        case SET_LOCAIOTNS:
            if (action.payload.length <= 0) return state;

            return {
                ...state,
                locations: action.payload
            }
        default: return state;
    }
};