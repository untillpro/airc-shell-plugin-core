/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import { generateId } from './Utils';
import ForeignKeys from '../const/ForeignKeys';

export const fetchData = async (entity, api, contributions, props) => {
    const getUrl = contributions.getPointContributionValue('url', entity, 'getUrl');

    let urlProps = { ...props };
    let resource;

    const result = {};

    if (getUrl && getUrl.resource && typeof getUrl.resource === 'string') {
        resource = getUrl.resource

        if (getUrl.props && typeof getUrl.props === 'object') {
            urlProps = { ...urlProps, ...getUrl.props };
        }
    } else {
        throw new Error(`MessageFetchListData: "getUrl" contribution for entity "${entity}" no specified or wrong given`, getUrl);
    }

    if (resource && api) {
        const { wsid, page, page_size, entries, show_deleted } = urlProps;

        let wsids = _.isArray(wsid) ? wsid : [ wsid ];

        return api.collection(resource, wsids, entries, page, page_size, show_deleted)
            .then((Data) => {
                if (Data) {
                    result.Data = Data;
                    result.data = applyClassifiers(Data, entity);

                    if (result.data) result.resolvedData = resolveData(result.data);
                }

                return result;
            })
            .catch((e) => {
                console.error(e);
                throw new Error(e);
            });
    } else {
        throw new Error(`${entity} error: 'api' not specified!`);
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
    const sectionsContributon = contributions.getPointContributions("forms", entity);

    if (sectionsContributon && sectionsContributon["embeddedTypes"]) {
        return sectionsContributon["embeddedTypes"];
    }

    return null;
}

export const getEntityFields = (entity, contributions, nonEmbedded = false) => {
    const sectionsContributon = contributions.getPointContributions("forms", entity);
    let sections = null;

    if (sectionsContributon && sectionsContributon["sections"]) {
        sections = sectionsContributon["sections"];
    }

    let fields = [];

    if (sections) {
        _.each(sections, (section) => {
            const sectionFields = contributions.getPointContributions("sections", section)["fields"];

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

                const res = processClassifier(item, classifiers[wsid], entity);

                if (!result[code]) result[code] = {};
                result[code][wsid] = res;
            });
        });
    }

    return result;
}

export const processClassifier = (item, classifiers, entity) => {

    if (!item) return {};

    _.forEach(item, (value, key) => {
        if (_.isArray(value)) {
            _.each(value, (val, i) => item[key][i] = processClassifier(val, classifiers, key));
        } else if (_.isObject(value)) {
            processClassifier(value, classifiers, key)
        } else {
            if (ForeignKeys[entity] && ForeignKeys[entity][key]) {
                let foreignEntity = ForeignKeys[entity][key];

                if (_.isNumber(value) && classifiers[foreignEntity] && classifiers[foreignEntity][value]) {
                    item[key] = classifiers[foreignEntity][value];
                } else {
                    item[key] = value;
                }
            }
        }
    });

    return item;
}

export const resolveData = (data) => {
    let resultData = [];

    _.each(data, (o) => {
        const arr = Object.values(o);
        const item = arr[0];

        if (item && typeof item === 'object') {
            item.linked = _.map(o, (row, loc) => {
                return {
                    id: Number(row.id),
                    wsid: Number(loc)
                };
            });

            resultData.push(item);
        }
        return item;
    });

    return resultData;
};

// DATA PROCESSING

export const processData = async (entity, data, entries, api, contributions) => {
    if (!api || !contributions || !entity) {
        throw new Error('Cant fetch entity item data.');
    }

    if (!data || typeof data !== 'object') {
        throw new Error('Wrong data specified to .', data);
    }

    const url = contributions.getPointContributionValue('url', entity, 'postUrl');

    if (!url || !url.resource || !url.queue) {
        throw new Error(`"postUrl" contribution is not specified for entity "${entity}"`)
    }

    let promises = [];

    if (entries && entries.length > 0) {

        promises = entries.map((entry) => {
            const { id, wsid } = entry;

            return proccessEntry(id, entity, wsid, data, { api, contributions });
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

export const proccessEntry = async (entityId, type, wsid, data, context) => {
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

    return api.conf(operations, [ wsid ], timestamp, offset).then((Data) => {
        return {
            ...Data,
            ID: entityId, 
            WSID: wsid
        };
    });
}

export const getOperation = (data, entityId, type, parentId, parentType, docId, docType, context) => {
    const { contributions } = context;
    let resultData = {};
    let operations = [];

    const id = entityId || -(generateId());

    if ("state" in data) resultData.state = Number(data.state) || 0;

    const fields = getEntityFields(type, contributions, true);

    if (fields && fields.length > 0) {
        _.each(fields, (field) => {
            const { accessor, value_accessor, entity, type: ftype } = field;

            if (!accessor || data[accessor] === undefined) return;

            if (ftype === 'embedded' && data[accessor]) {
                _.each(data[accessor], (d) => {
                    if (!d) return;

                    const ops = getOperation(d, d.id, entity, id, type, !docId ? id : docId, !docType ? type : docType, context);

                    if (ops && ops.length > 0) {
                        operations = [...operations, ...ops];
                    }
                });
            } else {
                if (value_accessor && typeof data[accessor] === 'object') {
                    resultData[accessor] = data[accessor][value_accessor];
                } else {
                    resultData[accessor] = data[accessor];
                }
            }
        });
    }

    const hiddenValues = contributions.getPointContributionValue('forms', type, 'hidden');

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