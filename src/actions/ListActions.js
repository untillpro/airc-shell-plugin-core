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
