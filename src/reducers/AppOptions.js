/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import {
    INIT_PLUGIN,
    SET_PLUGIN_LANGUAGE,
    TOGGLE_LOCATIONS_SELECTOR,
    ADD_AVAILABLE_LANGUAGE
} from '../actions/Types';

const INITIAL_STATE = {
    defaultLanguage: 'en',
    currentLanguage: null,
    langCode: '0000',
    defaultLangCode: '0000',
    maxUploadImageSize: 102400,
    showLocationSelector: true,
    allowMultyLocations: false,
    show_selector: false,
    defaultCurrency: {
        code: "Euro",
        digcode: 0,
        eurozone: 1,
        id: 5000000058,
        name: "Euro",
        rate: 1,
        round: 2,
        state: 1,
        sym_alignment: 1,
        symbol: "€"
    },
    currency: null,
    availableLanguages: ["0000", "0406", "0813", "040C", "0407", "0410"]
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case INIT_PLUGIN:
            const { options } = action.payload;

            if (options) {
                const { currentLanguage, defaultLanguage } = options;
                const newState = { ...state };

                if (_.isPlainObject(currentLanguage) && currentLanguage.code) {
                    newState.langCode = currentLanguage.code;
                    newState.currentLanguage = currentLanguage.locale;
                }

                if (_.isPlainObject(defaultLanguage) && defaultLanguage.code) {
                    newState.defaultLangCode = defaultLanguage.code;
                    newState.defaultLanguage = defaultLanguage.locale;
                }

                return newState;
            }

            return state;

        case SET_PLUGIN_LANGUAGE:
            if (_.isPlainObject(action.payload)) {
                console.log("setting lanh to: ", action.payload);
                return {
                    ...state,
                    langCode: action.payload.code,
                    currentLanguage: action.payload.locale
                };
            }

            return state;

        case TOGGLE_LOCATIONS_SELECTOR:
            return {
                ...state,
                show_selector: !state.show_selector
            };
            
        case ADD_AVAILABLE_LANGUAGE:

            return {
                ...state,
                availableLanguages: _.uniq([...state.availableLanguages, action.payload])
            };

        default: return state;
    }
};