/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

// # EVENT TYPES

export const EVENT_ORDER = 'orders';
export const EVENT_BILL = 'pbill';

// ## CONTRIBUTION TYPES

export const TYPE_MANAGERS = "managers"; //?
export const TYPE_VIEWS = "views";
export const TYPE_ENTITIES = "entities";
export const TYPE_REPORTS = "reports";
export const TYPE_EMBEDED_MANAGERS = "embededManagers";
export const TYPE_LANGUAGE = "lang";
export const TYPE_LIST = "list";
export const TYPE_URL = "url";
export const TYPE_FORMS = "forms";
export const TYPE_FORMSGROUPS = "formsgroups";
export const TYPE_SECTIONS = "sections";
export const TYPE_COLLECTION = "collection";

// ## POINTS CONTRIBUTIONS

// ### MANAGERS

export const C_MANAGER_CLASS = "class";

// ### VIEWS
export const  C_VIEW_CLASS = "class";
export const  C_VIEW_NAME = "name";
export const  C_VIEW_CODE = "code";
export const  C_VIEW_DESCRIPTION = "description";
export const  C_VIEW_ICO = "ico";
export const  C_VIEW_ORDER = "order";
export const  C_VIEW_TYPE = "type";
export const  C_VIEW_REPORTS = "reports";
export const  C_VIEW_MANAGERS = "managers";

// ### ENTITIES

export const  C_ENTITY_NAME = "name";
export const  C_ENTITY_CODE = "code"; //?
export const  C_ENTITY_DESCRIPTION = "description";
export const  C_ENTITY_ICO = "ico";
export const  C_ENTITY_ORDER = "order";
export const  C_ENTITY_TYPE = "type";

// ### REPORTS

export const C_REPORT_CLASS = "class";
export const C_REPORT_NAME = "name";
export const C_REPORT_ORDER = "order";
export const C_REPORT_GENERATOR = "generator";
export const C_REPORT_PROPERTIES = "properties";
export const C_REPORT_FIELDS = "fields";
export const C_REPORT_COLUMNS = "columns";
export const C_REPORT_TABLE_PROPS = "table_props";
export const C_REPORT_EVENT_TYPE = "event_type";
export const C_REPORT_COMPLEX = "is_complex";

// ### EMBEDED MANAGERS

export const C_EMBEDED_MANAGERS_CLASS = "class";
// ### LANGUAGE

// ### LIST

export const C_LIST_COLUMNS = "columns";
export const C_LIST_COMPONENT = "component";
export const C_LIST_PAGINATION = "pagination";
export const C_LIST_ACTIONS = "actions";
// ### URL

export const C_URL_GET_URL = "getUrl";
export const C_URL_POST_URL = "postUrl";

// ### FORMS

export const C_FORMS_COMPONENT = "component";
export const C_FORMS_SECTIONS = "sections";
export const C_FORMS_EMBEDDED_TYPE = "embeddedTypes";
export const C_FORMS_HIDDEN = "hidden";

// ### FORMSGROUPS

export const C_FORMSGROUPS_NAME = "name"
export const C_FORMSGROUPS_TABS = "tabs"
export const C_FORMSGROUPS_PROPS = "tabsProps"

// ### SECTIONS

export const C_SECTION_NAME = "name";
export const C_SECTION_FIELDS = "fields";

// ### COLLECTION

export const C_COLLECTION_REQUIRED_CLASSIFIERS = "required_classifiers";
export const C_COLLECTION_REQUIRED_FIELDS = "required_fields";