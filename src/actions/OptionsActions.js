/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */


import _ from 'lodash';
import i18next from 'i18next';

import {
    ADD_AVAILABLE_LANGUAGE,
    SET_PLUGIN_LANGUAGE
} from './Types';

export const setLanguage = (lang) => {
    return (dispatch, getState) => {

        if (_.isObject(lang)) {
            const { locale } = lang;

            if (_.isString(locale)) {
                if (i18next.languages.indexOf(locale) >= 0) {
                    i18next.changeLanguage(locale, () => {
                        dispatch({
                            type: SET_PLUGIN_LANGUAGE,
                            payload: lang
                        });
                    });
                } else {
                    throw new Error(`setLanguage error: lang "${locale}" is not presented in current laguages list; allowed languages are: ${i18next.languages}`);
                }
            } else {
                throw new Error(`setLanguage error: wrong locale specified: "${locale}"; string expected`);
            }
        } else {
            throw new Error("setLanguage error: lang param should be a pure object.");
        }
    };
};

export const addAvailableLanguage = (lang) => {
    return {
        type: ADD_AVAILABLE_LANGUAGE,
        payload: lang
    };
};



