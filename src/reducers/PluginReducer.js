/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import * as Types from '../actions/Types';
import { mergeExisting } from '../classes/Utils';

const INITIAL_STATE = {
    show_selector: false,
    locations: [ 1 ],
    selectedLocations: {},
    data: {},
    view: null,
    entity: null,
    step: null,
    entityData: null,
    fetchingData: false,
    list: {
        data: [],
        manual: false,
        showDeleted: false,
        page: 0,
        pages: -1,
        pageSize: 20
    },
    isNew: false,
    isCopy: false,
    columnsVisibility: {"ID": false, "id": false, "Id": false}
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case Types.TOGGLE_LOCATIONS_SELECTOR: 
            return {
                ...state,
                show_selector: !state.show_selector
            };
        case Types.SET_LOCAIOTNS: 
            if (action.payload.length <= 0) return state;

            return {
                ...state,
                locations: action.payload
            }

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

        case Types.SET_LIST_COLUMNS_VISIBILITY: 
            return {
                ...state,
                columnsVisibility: action.payload
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
