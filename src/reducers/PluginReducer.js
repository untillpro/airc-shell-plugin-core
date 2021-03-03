/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import * as Types from '../actions/Types';
import { mergeExisting } from '../classes/helpers';

const INITIAL_STATE = {
    data: {},
    view: null,
    entity: null,
    step: null,
    entityData: null,
    fetchingData: false,
    isNew: false,
    isCopy: false,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case Types.SEND_STATE_MACHINE_DATA: 
            return mergeExisting(state, action.payload);

        case Types.SET_VIEW: 
            return {
                ...state,
                view: action.payload,
                entity: null
            };
        
        case Types.SET_ENTITY: 
            return {
                ...state,
                entity: action.payload
            };

        case Types.SEND_DO_GENERATE_REPORT_MESSAGE:  
            return {
                ...state,
                fetchingData: true
            };

        default: 
            return state;
    }
};
