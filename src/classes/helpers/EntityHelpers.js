/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import blacklist from 'blacklist';
import { Logger } from 'airc-shell-core';

import { generateId } from './';
import ForeignKeys from '../../const/ForeignKeys';

import { reduce } from './';

import {
    TYPE_FORMS,
    TYPE_SECTIONS,
    TYPE_COLLECTION,
    C_COLLECTION_FILTER_BY,
    C_COLLECTION_ENTITY
} from '../contributions/Types';

export const isValidEntity = (context, entity) => {
    // TODO: implement more complex checks here

    if (!entity || !_.isString(entity) || entity === "") {
        return false;
    }

    return true;
}

export const getCollection = async (context, resource, wsid, props) => {
    const { api } = context;

    const result = {};

    if (resource && api) {
        let wsids = _.isArray(wsid) ? wsid : [wsid];

        return api.collection(resource, wsids, blacklist(props, "wsid"))
            .then((Data) => {
                if (Data) {
                    result.Data = Data;
                    result.data = applyClassifiers(Data, resource);

                    if (result.data) result.resolvedData = resolveData(result.data);
                }

                return result;
            })
            .catch((e) => {
                console.error(e);
                throw new Error(e);
            });
    } else {
        throw new Error(`${resource} error: 'api' not specified!`);
    }
};

export const buildData = (Data, locations) => {
    const { data } = Data;
    const resultData = [];

    if (!locations || locations.length <= 0) return [];

    const wsid = locations[0];

    if (!_.isNumber(wsid)) return [];
    if (!data || _.size(data) <= 0) return [];

    _.each(data, (value) => {
        //TODO make state check optional in field decloration
        if (value[wsid] && value[wsid].state === 1) {
            resultData.push(value[wsid]);
        }
    });

    return resultData;
}

export const getEntityEmbeddedTypes = (entity, contributions) => {
    const sectionsContributon = contributions.getPointContributions(TYPE_FORMS, entity);

    if (sectionsContributon && sectionsContributon["embeddedTypes"]) {
        return sectionsContributon["embeddedTypes"];
    }

    return null;
}

export const getEntityFields = (entity, contributions, nonEmbedded = false) => {
    const sectionsContributon = contributions.getPointContributions(TYPE_FORMS, entity);
    let sections = null;

    if (sectionsContributon && sectionsContributon["sections"]) {
        sections = sectionsContributon["sections"];
    }

    let fields = [];

    if (sections) {
        _.each(sections, (section) => {
            const sectionFields = contributions.getPointContributions(TYPE_SECTIONS, section)["fields"];

            if (sectionFields && sectionFields.length > 0) {
                fields = [...fields, ...sectionFields];
            }
        });
    }

    if (nonEmbedded) {
        let newFields = [];

        _.each(fields, (field) => {
            if (field.embedded !== true) {
                newFields.push(field);
            }
        });

        fields = newFields;
    }

    return fields;
}

export const applyClassifiers = (Data, Entity) => {
    const { data, classifiers } = Data;

    let entity = String(Entity).toLowerCase();
    let result = { ...data };

    if (
        classifiers && _.size(classifiers) > 0 &&
        data && _.size(data) > 0
    ) {
        _.forEach(data, (variants, code) => {
            _.forEach(variants, (item, wsid) => {
                if (!classifiers[wsid]) return;

                const res = processClassifier(item, classifiers[wsid], entity, wsid, 0, null);

                if (!result[code]) result[code] = {};
                result[code][wsid] = res;
            });
        });
    }

    return result;
}

export const processClassifier = (item, classifiers = {}, entity, wsid, maxLevel = 3, level = 0) => {
    if (!item) return {};

    if (!classifiers || _.size(classifiers) == 0) return item;
    if (maxLevel > 0 && level >= maxLevel) return item;

    _.forEach(item, (value, key) => {
        if (_.isArray(value)) {
            _.each(value, (val, i) => item[key][i] = processClassifier(val, classifiers, key, wsid, maxLevel, level + 1, ));
        } else if (_.isObject(value)) {
            processClassifier(value, classifiers, key, wsid, maxLevel, level + 1)
        } else {
            if (ForeignKeys[entity] && ForeignKeys[entity][key]) {
                let foreignEntity = ForeignKeys[entity][key];

                if (_.isNumber(value) && classifiers[foreignEntity] && classifiers[foreignEntity][value]) {
                    item[key] = classifiers[foreignEntity][value];

                    processClassifier(item[key], classifiers, foreignEntity, wsid, maxLevel, level + 1);
                } else {
                    item[key] = value;
                }
            }
        }
    });

    if (item.id && !item._entry) {
        item._entry = { id: item.id, wsid };
    }

    return item;
}

export const resolveData = (data) => {
    let resultData = [];

    _.each(data, (o) => {
        _.forEach(o, (row, loc) => {
            row.location = loc;
            row._entry = {
                id: Number(row.id),
                wsid: Number(loc)
            };
        });

        const arr = Object.values(o);
        const item = { ...arr[0] };

        if (arr.length > 1) {
            item.variants = arr;
        }

        resultData.push(item);
    });

    return resultData;
};

export const getFilterByString = (context, entity) => {
    const { contributions } = context;

    if (!contributions) return null;

    let filter = contributions.getPointContributionValue(TYPE_COLLECTION, entity, C_COLLECTION_FILTER_BY);

    if (filter) {
        if (_.isString(filter)) {
            try {
                if (JSON.parse(filter)) {
                    return filter;
                }
            } catch (e) {
                Logger.error(e.toString(), `Wrong filter string specified for ${entity} entity`, "EntityHelpers.getFilterByString()");
            }
        } else if (_.isPlainObject(filter)) {
            return JSON.stringify(filter);
        }
    }

    return null;
};

// DATA PROCESSING


export const processData = async (context, entity, data, entries) => {
    console.log("ProcessData call: ", data);
    
    if (!data || typeof data !== 'object') {
        throw new Error('Wrong data specified to .', data);
    }

    let promises = [];

    if (entries && entries.length > 0) {

        promises = entries.map((entry) => {
            const { id, wsid } = entry;

            return proccessEntry(context, id, entity, wsid, data);
        });
    } else {
        throw new Error('Cant create new entry: no selected locations found');
    }

    if (promises.length > 0) {
        return Promise.all(promises);
    } else {
        throw new Error('Nothing to proceed');
    }
}

export const proccessEntry = async (context, entityId, type, wsid, data) => {
    const { api, contributions } = context;

    const id = entityId || -(generateId());

    let operations = getOperation(data, id, type, 0, '', 0, '', context);

    operations.reverse();

    // embeded types

    const embeddedTypes = getEntityEmbeddedTypes(type, contributions);

    if (embeddedTypes && embeddedTypes.length > 0) {
        _.each(embeddedTypes, (eType) => {
            if (data[eType]) {
                let d = data[eType];
                let eId = d && d.id ? parseInt(d.id) : null;
                let ops = getOperation(d, eId, eType, id, type, id, type, context);

                if (ops && ops.length > 0) {
                    operations = [...operations, ...ops];
                }
            }
        });
    }

    const timestamp = (new Date()).valueOf();

    const offset = 0; // TODO - ask Maxim about that offset

    return api.conf(operations, [wsid], timestamp, offset).then((Data) => {
        return {
            ...Data,
            ID: entityId,
            WSID: wsid
        };
    });
}

export const getOperation = (data, entityId, entity, parentId, parentType, docId, docType, context) => {
    const { contributions } = context;
    let resultData = {};
    let operations = [];

    const id = entityId || -(generateId());
    let type = contributions.getPointContributionValue(TYPE_COLLECTION, entity, C_COLLECTION_ENTITY) || entity;

    if ("state" in data) resultData.state = Number(data.state) || 0;

    const fields = getEntityFields(type, contributions, true);

    if (fields && fields.length > 0) {
        _.each(fields, (field) => {
            const { accessor, value_accessor, entity: fentity, type: ftype } = field;

            if (!accessor || data[accessor] === undefined) return;

            if (ftype === 'embedded' && data[accessor]) {
                _.each(data[accessor], (d) => {
                    if (!d) return;

                    const ops = getOperation(d, d.id, fentity, id, type, !docId ? id : docId, !docType ? type : docType, context);

                    if (ops && ops.length > 0) {
                        operations = [...operations, ...ops];
                    }
                });
            } else {
                if (value_accessor && data[accessor] && typeof data[accessor] === 'object') {
                    resultData[accessor] = data[accessor][value_accessor];
                } else {
                    resultData[accessor] = data[accessor];
                }
            }
        });
    }

    const hiddenValues = contributions.getPointContributionValue(TYPE_FORMS, entity, 'hidden');

    if (hiddenValues && typeof _.isObject(hiddenValues) && !_.isArray(hiddenValues)) {
        resultData = { ...resultData, ...hiddenValues };
    }

    if (_.size(resultData) > 0) {
        if (parentType && parentId) {
            resultData[`id_${parentType}`] = parentId;
        }

        operations.push({
            ID: id,
            Type: type,
            ParentID: parentId,
            ParentType: parentType,
            DocID: docId,
            DocType: docType,
            Data: resultData
        });
    }

    return operations;
}

export const checkEntries = (entries) => {
    const resultEntries = [];

    if (!entries || entries.length <= 0) return false;

    for (let i = 0; i < entries.length; i++) {
        if (!entries[i]) continue;

        const { id, wsid } = entries[i];

        if ((id > 0 && wsid > 0)) {
            resultEntries.push({ id, wsid });
        }
    }

    return resultEntries;
}

export const checkEntry = (entry) => {
    const { id, wsid } = entry;

    return (id > 0 && wsid > 0)
}

export const prepareCopyData = (data) => {
    if (data && _.isPlainObject(data)) {
        return reduce(
            data,
            (r, v, k) => {
                if (k === "id") return;
                else r[k] = v;
            },
            (v, k) => typeof v === 'object' && String(k).indexOf('id_') !== 0
        );
    }

    return {};
}