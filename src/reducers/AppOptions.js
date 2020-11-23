/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import { 
     TOGGLE_LOCATIONS_SELECTOR,
     ADD_AVAILABLE_LANGUAGE
} from '../actions/Types';

const INITIAL_STATE = {
    lang: '0000', //todo
    defaultLang: '0000',
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
    currency: null,
    availableLanguages: [ "0000", "0406", "0813", "040C", "0407", "0410" ]
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case TOGGLE_LOCATIONS_SELECTOR:
            return {
                ...state,
                show_selector: !state.show_selector
            };
        case ADD_AVAILABLE_LANGUAGE: 

            return {
                ...state,
                availableLanguages: _.uniq([ ...state.availableLanguages, action.payload ])
            };

        default: return state;
    }
};