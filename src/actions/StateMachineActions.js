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
    SEND_NEED_ITEM_PROCESS_DATA,
    SEND_NEED_DUPLICATE_ITEM_MESSAGE,
    SEND_NEED_UNIFY_ITEM_MESSAGE,
    SEND_NEED_REMOVE_ITEM_MESSAGE,
    SEND_NEED_REDUCE_ITEM_MESSAGE,
    SEND_NEED_PROCCESS_DATA_MESSAGE,
    SEND_NEED_VALIDATE_DATA_MESSAGE,
    SEND_NEED_LIST_DATA_REFRESH,
    SEND_FORM_NEED_NAVIGATION
} from './Types';

import {
    MessageProcessItemData
} from '../classes/messages';

export const doProccess = (entries, data) => {
    console.log("doProccess", entries, data);
    return (dispatch, getState) => {
        const { context } = getState();
        const { api, sm } = context;

        const msg = new MessageProcessItemData({entries, data});

        return sm.sendMessage(msg, context)
            .then((data) => {
                console.log("doProccess.then", data);

                dispatch(sendStateMachineResult(
                    sm.getCurrenStepName(),
                    data
                ));

                // if response has errors will send error to shell
                if (data.error) {
                    api.sendError(data.error);
                }
            })
            .catch((e) => {
                console.log("doProccess.catch", e);
                // if request crashed will send error to shell
                api.sendError(e);
            });
    }
}

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
    return (dispatch, getState) => {
        const { locations } = getState();

        dispatch({
            type: SEND_SELECT_VIEW_MESSAGE,
            payload: {
                view,
                locations: locations.locations
            }
        })
    };
};

export const sendSelectEntityMessage = (entity) => {
    return (dispatch, getState) => {
        const { locations } = getState();

        dispatch({
            type: SEND_SELECT_ENTITY_MESSAGE,
            payload: {
                entity,
                locations: locations.locations
            }
        })
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

export const sendNeedEditFormMessage = (entries = []) => {
    return (dispatch, getState) => {
        const { locations, plugin } = getState();

        dispatch({
            type: SEND_NEED_EDIT_FORM_MESSAGE,
            payload: {
                entries,
                entity: plugin.entity,
                locations: locations.locations
            }
        })
    };
};

export const sendNeedMassEditFormMessage = (entries = []) => {
    return (dispatch, getState) => {
        const { locations, plugin } = getState();

        dispatch({
            type: SEND_NEED_MASSEDIT_FORM_MESSAGE,
            payload: {
                entries,
                entity: plugin.entity,
                locations: locations.locations
            }
        })
    };
};

export const sendNeedCopyFormMessage = (entries = []) => {
    return (dispatch, getState) => {
        const { locations, plugin } = getState();

        dispatch({
            type: SEND_NEED_DUPLICATE_ITEM_MESSAGE,
            payload: {
                entries,
                entity: plugin.entity,
                locations: locations.locations,
                copy: true
            }
        })
    };
};

export const sendNeedUnifyFormMessage = (entries = []) => {
    return (dispatch, getState) => {
        const { locations, plugin } = getState();

        dispatch({
            type: SEND_NEED_UNIFY_ITEM_MESSAGE,
            payload: {
                entries,
                entity: plugin.entity,
                locations: locations.locations
            }
        })
    };
};

export const sendNeedProcessMessage = (entries, data) => {
    return {
        type: SEND_NEED_ITEM_PROCESS_DATA,
        payload: { entries, data }
    };
};

// removing entites items by id; 
export const sendNeedRemoveMessage = (entries) => {
    return {
        type: SEND_NEED_REMOVE_ITEM_MESSAGE,
        payload: entries
    };
};

export const sendNeedReduceMessage = (entries) => {
    return {
        type: SEND_NEED_REDUCE_ITEM_MESSAGE,
        payload: entries
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