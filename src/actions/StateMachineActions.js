/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    SEND_STATE_MACHINE_DATA,
    SEND_CANCEL_MESSAGE,
    SEND_SELECT_VIEW_MESSAGE,
    SEND_SELECT_ENTITY_MESSAGE,
    SEND_NEED_FETCH_LIST_DATA,
    SEND_NEED_EDIT_FORM_MESSAGE,
    SEND_NEED_MASSEDIT_FORM_MESSAGE,
    SEND_NEED_DUPLICATE_ITEM_MESSAGE,
    SEND_NEED_UNIFY_ITEM_MESSAGE,
    SEND_NEED_REMOVE_ITEM_MESSAGE,
    SEND_NEED_REDUCE_ITEM_MESSAGE,
    SEND_NEED_PROCCESS_DATA_MESSAGE,
    SEND_NEED_VALIDATE_DATA_MESSAGE,
    SEND_NEED_LIST_DATA_REFRESH,
    SEND_FORM_NEED_NAVIGATION
} from './Types';

export const sendStateMachineResult = (step, data) => {
    return {
        type: SEND_STATE_MACHINE_DATA,
        payload: {
            step,
            ...data
        }
    };
};

export const sendCancelMessage = (data = {}) => {
    return {
        type: SEND_CANCEL_MESSAGE,
        payload: data
    };
};

export const sendSelectViewMessage = (view) => {
    return {
        type: SEND_SELECT_VIEW_MESSAGE,
        payload: view
    };
};

export const sendSelectEntityMessage = (entity) => {
    return {
        type: SEND_SELECT_ENTITY_MESSAGE,
        payload: entity
    };
};

export const sendNeedFetchListDataMessage = (props) => {
    return {
        type: SEND_NEED_FETCH_LIST_DATA,
        payload: props

    };
};

export const sendNeedRefreshListDataMessage = () => {
    return {
        type: SEND_NEED_LIST_DATA_REFRESH
    };
}

export const sendNeedEditFormMessage = ( entries = [] ) => {
    return {
        type: SEND_NEED_EDIT_FORM_MESSAGE,
        payload: entries
    };
};

export const sendNeedMassEditFormMessage = ( entries = [] ) => {
    return {
        type: SEND_NEED_MASSEDIT_FORM_MESSAGE,
        payload: entries
    };
};

export const sendNeedCopyFormMessage = (entries = []) => {
    return {
        type: SEND_NEED_DUPLICATE_ITEM_MESSAGE,
        payload: entries
    };
};

export const sendNeedUnifyFormMessage = (entries = []) => {
    return {
        type: SEND_NEED_UNIFY_ITEM_MESSAGE,
        payload: entries
    };
};

// removing entites items by id; // TODO Locations
export const sendNeedRemoveMessage = (entry) => {
    return {
        type: SEND_NEED_REMOVE_ITEM_MESSAGE,
        payload: entry
    };
};

export const sendNeedReduceMessage = (entry) => {
    return {
        type: SEND_NEED_REDUCE_ITEM_MESSAGE,
        payload: entry
    };
};

// updating or creating entity item
export const sendNeedProccessMessage = (data) => {
    return {
        type: SEND_NEED_PROCCESS_DATA_MESSAGE,
        payload: data
    };
}

// validate entity item data
export const sendNeedValidateMessage = (data) => {
    return {
        type: SEND_NEED_VALIDATE_DATA_MESSAGE,
        payload: data
    };
}

// send message to receive 

export const sendNeedFormNavigation = (id) => {
    return {
        type: SEND_FORM_NEED_NAVIGATION,
        payload: id
    };
}