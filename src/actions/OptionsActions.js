/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */


import _ from 'lodash';
import i18next from 'i18next';
import lc from 'langcode-info';

import {
    ADD_AVAILABLE_LANGUAGE,
    SET_PLUGIN_LANGUAGE
} from './Types';

export const setLanguage = (langCode) => {
    return (dispatch, getState) => {

        if (_.isString(langCode)) {
            const lang = lc.langByHex(langCode);
            const lex = lang.lex();

            if (_.isString(lex)) {
                if (i18next.languages.indexOf(lex) >= 0) {
                    i18next.changeLanguage(lex, () => {
                        dispatch({
                            type: SET_PLUGIN_LANGUAGE,
                            payload: langCode
                        });
                    });
                } else {
                    throw new Error(`setLanguage error: lang "${lex}" is not presented in current laguages list; allowed languages are: ${i18next.languages}`);
                }
            } else {
                throw new Error(`setLanguage error: wrong locale specified: "${lex}"; string expected`);
            }
        }
    };
};

export const addAvailableLanguage = (lang) => {
    return {
        type: ADD_AVAILABLE_LANGUAGE,
        payload: lang
    };
};



