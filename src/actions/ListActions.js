/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    SEND_NEED_EDIT_FORM_MESSAGE,
    SEND_NEED_DUPLICATE_ITEM_MESSAGE,
    SEND_NEED_UNIFY_ITEM_MESSAGE,
    SEND_NEED_REMOVE_ITEM_MESSAGE,
    SEND_NEED_REDUCE_ITEM_MESSAGE,

    ENTITY_LIST_SET_SHOW_DELTED,
    ENTITY_LIST_SET_FILTER,
    ENTITY_LIST_SET_ORDER,
    ENTITY_LIST_SET_PAGE,
    ENTITY_LIST_SET_PAGE_SIZE,
    ENTITY_LIST_SAVE_RESOLVED_DATA
} from './Types';


export const listRowEdit = (id) => {
    return {
        type: SEND_NEED_EDIT_FORM_MESSAGE,
        payload: id
    };
};

export const listRowCopy = (id) => {
    return {
        type: SEND_NEED_DUPLICATE_ITEM_MESSAGE,
        payload: id
    };
};

export const listRowUnify = (id) => {
    return {
        type: SEND_NEED_UNIFY_ITEM_MESSAGE,
        payload: id
    };
};

export const listRowRemove = (id) => {
    return {
        type: SEND_NEED_REMOVE_ITEM_MESSAGE,
        payload: id
    };
};

export const listRowReduce = (id) => {
    return {
        type: SEND_NEED_REDUCE_ITEM_MESSAGE,
        payload: id
    };
};


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

export const saveResolvedData = (data) => {
    return {
        type: ENTITY_LIST_SAVE_RESOLVED_DATA,
        payload: data
    }
};