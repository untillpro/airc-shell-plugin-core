/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { 
     TOGGLE_LOCATIONS_SELECTOR 
} from '../actions/Types';

const INITIAL_STATE = {
    lang: 'en', //todo
    maxUploadImageSize: 102400,
    showLocationSelector: true,
    allowMultyLocations: false,
    show_selector: false,
    defaultCurrency: {
        "code": "Euro",
        "digcode": 0,
        "eurozone": 1,
        "id": 5000000058,
        "name": "Euro",
        "rate": 1,
        "round": 2,
        "state": 1,
        "sym_alignment": 1,
        "symbol": "€"
    },
    currency: null
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case TOGGLE_LOCATIONS_SELECTOR:
            return {
                ...state,
                show_selector: !state.show_selector
            };
        default: return state;
    }
};