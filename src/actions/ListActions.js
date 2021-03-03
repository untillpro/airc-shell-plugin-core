/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    ENTITY_LIST_SET_SHOW_DELTED,
    ENTITY_LIST_SET_FILTER,
    ENTITY_LIST_SET_ORDER,
    ENTITY_LIST_SET_PAGE,
    ENTITY_LIST_SET_PAGE_SIZE
} from './Types';

import {
    SAGA_PROCESS_DATA    
} from '../sagas/Types';

//TODO implement with saga
export const listProccessData = (entity, entries, data) => {
    return {
        type: SAGA_PROCESS_DATA,
        payload: {
            entity, entries, data
        }
    };

    /*
            return (dispatch, getState) => {
        const { context } = getState();
        const { api, sm } = context;

        const msg = new MessageProcessItemData({ entries, data });

        return sm.sendMessage(msg, context)
            .then((data) => {
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
                // if request crashed will send error to shell
                api.sendError(e);
            });
    }
    */
}

export const setListShowDeleted = (val) => {
    return {
        type: ENTITY_LIST_SET_SHOW_DELTED,
        payload: !!val
    }
};

export const setListPage = (val) => {
    return {
        type: ENTITY_LIST_SET_PAGE,
        payload: val
    }
};

export const setListPageSize = (val) => {
    return {
        type: ENTITY_LIST_SET_PAGE_SIZE,
        payload: val
    }
};

export const setListFilter = (fitler) => {
    return {
        type: ENTITY_LIST_SET_FILTER,
        payload: fitler
    }
};

export const setListOrder = (order) => {
    return {
        type: ENTITY_LIST_SET_ORDER,
        payload: order
    }
};

