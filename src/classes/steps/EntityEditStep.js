/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import StateMachineStep from '../StateMachineStep';
import { Logger } from 'airc-shell-core';
import { MessageInit, MessageNotify } from '../messages';

import {
    prepareCopyData,
    isValidLocations,
    isValidEntity,
    getCollection,
    processData,
    checkEntries
} from '../helpers';

import {
    TYPE_FORMS,
    TYPE_COLLECTION,
    C_COLLECTION_ENTITY,
    C_COLLECTION_REQUIRED_CLASSIFIERS
} from '../contributions/Types';


class EntityEditStep extends StateMachineStep {
    constructor(...args) {
        super(args);

        this.data = null;
        this.classifiers = null;
        this.next = null;
        this.prev = null;
        this.entries = null;
        this.entity = null;
        this.locations = null;
    }

    getName() {
        return 'EntityEditStep';
    }

    _data() {
        return {
            data: this.data,
            classifiers: this.classifiers,
            next: this.next,
            prev: this.prev
        };
    }

    async MessageInit(msg, context) {
        const { entries, copy, entity, locations } = msg;

        if (!isValidEntity(context, entity)) {
            throw new Error(this.getName() + '.MessageInit() exception: entity not specified or wrong given: ' + entity.toString());
        }

        if (!isValidLocations(locations)) {
            throw new Error(this.getName() + '.MessageInit() exception: locations not specified or wrong given: ' + locations.toString());
        }

        this.entity = entity;
        this.locations = locations;

        this.entries = checkEntries(entries);
        let isNotNew = this.entries && this.entries.length > 0;

        if (isNotNew) {
            await this.fetchEntityData(this.entries, context);
            Logger.log(this.data, 'EntityEditStep.MessageInit() fetched data:', "EntityEditStep.MessageInit");

            if (copy === true && this.data) { // if operation is copy
                this.entries = null;
                this.data = prepareCopyData(this.data);
            }
        }

        return {
            changedData: {
                isCopy: copy === true,
                isNew: !isNotNew,
                entityData: this._data()
            }
        };
    }

    async MessageNeedEdit(msg) {
        return {
            pop: true,
            message: new MessageInit(msg),
            newStep: new EntityEditStep()
        };
    }

    async MessageCancel() {
        return {
            pop: true,
            message: new MessageNotify()
        };
    }

    async MessageProceed(msg, context) {
        let { entries, entity, locations } = this;
        const { data } = msg;

        if (msg.entity && typeof msg.entity === 'string') {
            entity = msg.entity
        }

        if (msg.locations) {
            locations = _.isArray(msg.locations) ? msg.locations : [msg.locations];
        }

        if ("entries" in msg) {
            entries = msg.entries;
        }

        if (!entries || entries.length <= 0) {
            if (locations && locations.length > 0) {
                entries = locations.map((wsid) => {
                    return { id: null, wsid };
                });
            } else {
                this.error('Proceed data error: locations are not specefied');
            }
        }
        
        return processData(context, entity, data, entries).then((res) => {
            return {
                pop: true,
                message: new MessageNotify({ refresh: true }),
                changedData: {
                    ...res
                }
            };
        }).catch((e) => {
            this.error(e.toString());
        });
    }

    async MessageValidate(msg, context) {
        return null;
    }

    async fetchEntityData(items, context) {
        const { api, contributions } = context;
        const { entity, locations } = this;

        let wsid = null;

        if (!api || !contributions || !entity) {
            this.error('Cant fetch entity item data.', api, contributions, entity);
        }

        if (isValidLocations(locations)) {
            wsid = locations[0];
        } else {
            this.error('No location selected.', api, contributions, entity);
        }

        let entries = this.buildRequestEntires(items);

        const doProps = {
            entries,
            required_classifiers: contributions.getPointContributionValues(TYPE_COLLECTION, entity, C_COLLECTION_REQUIRED_CLASSIFIERS)
        };

        let resource = contributions.getPointContributionValue(TYPE_COLLECTION, entity, C_COLLECTION_ENTITY) || entity;

        return getCollection(context, resource, wsid, doProps)
            .then(({ Data, resolvedData }) => {
                if (resolvedData && resolvedData.length > 0) {
                    this.classifiers = _.get(Data, "classifiers");
                    this.data = this.checkForEmbededTypes(resolvedData[0], context);
                } else {
                    this.classifiers = null;
                    this.data = [];
                }
            });
    }

    checkForEmbededTypes(data, context) {
        const { contributions } = context;
        const { entity } = this;

        if (!contributions || !entity) return data;

        const Data = { ...data };

        const pointContributions = contributions.getPointContributions(TYPE_FORMS, entity);
        const embedded_types = pointContributions ? pointContributions.embeddedTypes : null;

        if (embedded_types && embedded_types.length > 0) {
            _.each(embedded_types, (type) => {
                if (Data[type] && Data[type] instanceof Object && Data[type].length > 0) {
                    Data[type] = Data[type][0];
                }
            });
        }

        return Data;
    }

    buildRequestEntires(entries) {
        const resultEntries = [];

        for (let i = 0; i < entries.length; i++) {
            resultEntries.push({ ID: entries[i].id, WSID: entries[i].wsid });
        }

        return resultEntries;
    }

    detouch() {
        return {
            isNew: false,
            isCopy: false,
            entityData: null
        };
    }
}

export default EntityEditStep; 
