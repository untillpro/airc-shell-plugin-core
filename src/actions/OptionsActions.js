import { 
    ADD_AVAILABLE_LANGUAGE,
} from './Types';

export const addAvailableLanguage = (lang) => {
    return {
        type: ADD_AVAILABLE_LANGUAGE,
        payload: lang
    };
};



