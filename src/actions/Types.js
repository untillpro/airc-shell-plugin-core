/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */



export const INIT_PLUGIN = 'init_plugin';
export const SET_LOCAIOTNS = 'set_locations';
export const TOGGLE_LOCATIONS_SELECTOR = 'toggle_locations_selector';

export const SET_VIEW = 'set_view';
export const SET_DATA = 'set_data';
export const SET_ENTITY = 'set_entity';

/* List actions */

export const SET_LIST_COLUMNS_VISIBILITY = 'set_list_columns_visibility';
export const TOGGLE_DELETED_ROWS_VIEW = 'toggle_deleted_rows_view';

/* State machine actions */

export const SEND_STATE_MACHINE_DATA = 'send_state_machine_data';

export const SEND_INIT_MESSAGE = 'message_init';
export const SEND_CANCEL_MESSAGE = 'message_cancel';
export const SEND_SELECT_VIEW_MESSAGE = 'message_select_view';
export const SEND_SELECT_ENTITY_MESSAGE = 'message_select_entity';

export const SEND_NEED_FETCH_LIST_DATA = 'message_need_fetch_list_data';
export const SEND_NEED_LIST_DATA_REFRESH = 'message_need_list_data_refresh';
export const SEND_NEED_EDIT_FORM_MESSAGE = 'message_need_edit_form';
export const SEND_NEED_MASSEDIT_FORM_MESSAGE = 'message_need_massedit_form';


export const SEND_NEED_ITEM_PROCESS_DATA = 'send_need_item_process_data';
export const SEND_NEED_DUPLICATE_ITEM_MESSAGE = 'message_duplicate_items';
export const SEND_NEED_UNIFY_ITEM_MESSAGE = 'message_unify_items';
export const SEND_NEED_REMOVE_ITEM_MESSAGE = 'message_remove_items';
export const SEND_NEED_REDUCE_ITEM_MESSAGE = 'message_reduce_items';
export const SEND_NEED_PROCCESS_DATA_MESSAGE = 'message_proccess_data';
export const SEND_NEED_VALIDATE_DATA_MESSAGE = 'message_validate_data';

export const ENTITY_LIST_SET_SHOW_DELTED = 'message_list_set_show_deleted';
export const ENTITY_LIST_SET_FILTER = 'message_list_set_filter';
export const ENTITY_LIST_SET_ORDER = 'message_list_set_order';
export const ENTITY_LIST_SET_PAGE = 'message_list_set_page';
export const ENTITY_LIST_SET_PAGE_SIZE = 'message_list_set_page_size';

export const SEND_FORM_NEED_NAVIGATION = 'message_edit_form_need_navigation';

export const SEND_ERROR_MESSAGE = 'send_error_api_message';
export const SEND_INFO_MESSAGE = 'send_info_api_message';
export const SEND_SUCCESS_MESSAGE = 'send_success_api_message';
export const SEND_WARNING_MESSAGE = 'send_warning_api_message';

/* REPORTS ACTIONS */

export const SELECT_REPORT_TYPE_MESSAGE = "select_report_type_message";
export const SEND_DO_GENERATE_REPORT_MESSAGE = "do_generate_report_message";
export const SELECT_DATETIME_FILTER_PERIOD = "select_datetime_filter_period";
export const SET_REPORTS_DATETIME_FILTER = "set_reports_datetime_filter"; 

/* CONTEXT ACTIONS */

export const ADD_TO_CONTEXT = "add_to_context";
export const INIT_CONTEXT_LANG = "init_context_lang";

/* OPTIONS ACTIONS */

export const SET_PLUGIN_LANGUAGE = "set_plugin_language";
export const ADD_AVAILABLE_LANGUAGE = "add_available_language";

