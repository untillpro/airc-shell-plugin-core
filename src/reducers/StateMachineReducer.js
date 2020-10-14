/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import * as Messages from '../classes/messages';
import * as Types from '../actions/Types';

const INITIAL_STATE = {
    message: new Messages.MessageInit(),
    isGlobal: false,
    shouldPop: false
};

export default (state = INITIAL_STATE, action) => {
    let message = null;
    let isGlobal = false;
    let shouldPop = false;
    
    switch (action.type) {
        case Types.SEND_INIT_MESSAGE: 
            message = new Messages.MessageInit(action.payload);
            break;

        case Types.SEND_CANCEL_MESSAGE:
            message = new Messages.MessageCancel(action.payload);
            break;

        case Types.SEND_SELECT_VIEW_MESSAGE:
            console.log("SEND_SELECT_VIEW_MESSAGE: ", action.payload);
            isGlobal = true;
            shouldPop = true;
            message = new Messages.MessageSelectView(action.payload);
            break;
            
        case Types.SEND_SELECT_ENTITY_MESSAGE:
            message = new Messages.MessageSelectEntity(action.payload);
            break;

        case Types.SEND_NEED_LIST_DATA_REFRESH: 
            message = new Messages.MessageRefreshListData();
            break;

        case Types.SEND_NEED_EDIT_FORM_MESSAGE:
            message = new Messages.MessageNeedEdit(action.payload);

            break;

        case Types.SEND_NEED_MASSEDIT_FORM_MESSAGE:
            if (_.isArray(action.payload) && action.payload.length > 0) {
                message = new Messages.MessageNeedMassEdit({ entries: action.payload });
            }
            
            break;

        case Types.SEND_NEED_PROCCESS_DATA_MESSAGE: 
            message = new Messages.MessageProceed({data: action.payload});
            break;

        case Types.SEND_NEED_DUPLICATE_ITEM_MESSAGE: 
            console.log("SEND_NEED_DUPLICATE_ITEM_MESSAGE: ", action.payload);

            message = new Messages.MessageNeedEdit(action.payload);

            break;

        case Types.SEND_NEED_REMOVE_ITEM_MESSAGE:
            if (_.isPlainObject(action.payload)) {
                message = new Messages.MessageSetItemState({ entry: action.payload, state: 0 });
            }
            
            break;

        case Types.SEND_NEED_REDUCE_ITEM_MESSAGE:
            if (_.isPlainObject(action.payload)) {
                message = new Messages.MessageSetItemState({ entry: action.payload, state: 1});
            }

            break;

        case Types.ENTITY_LIST_SET_SHOW_DELTED: 
            message = new Messages.MessageSetShowDeleted({ showDeleted: action.payload  });
            break;

        case Types.ENTITY_LIST_SET_PAGE: 
            message = new Messages.MessageSetPage({ page: action.payload });
            break;

        case Types.ENTITY_LIST_SET_PAGE_SIZE: 
            message = new Messages.MessageSetPageSize({ pageSize: action.payload });
            break;

        case Types.ENTITY_LIST_SET_FILTER: 
            message = new Messages.MessageSetFilter({ filter: action.payload });
            break;

        case Types.ENTITY_LIST_SET_ORDER: 
            message = new Messages.MessageSetOrder({ order: action.payload });
            break;

        case Types.SEND_FORM_NEED_NAVIGATION:
            message = new Messages.MessageNeedNavigation({id: action.payload});
            isGlobal = true;
            break;

        case Types.SEND_DO_GENERATE_REPORT_MESSAGE:
            message = new Messages.MessageGenerateReport(action.payload);
            break;

        default: break;
    }

    if (message) {
        return {
            ...state,
            message,
            isGlobal,
            shouldPop
        };
    }

    return state;
};
