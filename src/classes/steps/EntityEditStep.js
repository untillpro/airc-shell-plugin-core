/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import StateMachineStep from '../StateMachineStep';
import Logger from '../../base/classes/Logger';
import { MessageInit, MessageNotify } from '../messages';

import {
    reduce
} from '../Utils';

import {
    fetchData,
    processData
} from '../EntityUtils';

class EntityEditStep extends StateMachineStep {
    constructor(...args) {
        super(args);

        this.context = null;
        this.data = null;
        this.entries = null;
    }

    getName() {
        return 'EntityEditStep';
    }

    async MessageInit(msg, context) {
        const { entries, copy } = msg;
        let data = null;

        this.entries = this.checkEntries(entries);

        if (this.entries) {
            data = await this.fetchEntityData(this.entries, context);

            if (copy && data) {
                this.entries = null;

                data = reduce(
                    data,
                    (r, v, k) => {
                        if (k === "id") return;
                        else r[k] = v;
                    },
                    (v, k) => typeof v === 'object' && String(k).indexOf('id_') !== 0
                );
            }

            Logger.log(data, 'EntityEditStep.MessageInit() fetched data:', "EntityEditStep.MessageInit");

            return {
                changedData: {
                    isCopy: !!copy,
                    isNew: false,
                    entityData: {
                        data,
                        prev: null,
                        next: null
                    }
                }
            };
        }

        return {
            changedData: {
                isCopy: false,
                isNew: true,
                entityData: {
                    data: null,
                    prev: null,
                    next: null
                }
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
        const { api, contributions } = context;
        let entity = null;
        let locations = null;
        let entries = null;

        if (msg.entity && typeof msg.entity === 'string') {
            entity = msg.entity
        } else if (context.entity && typeof context.entity === 'string') {
            entity = context.entity
        } else {
            this.error('EntityEditStep: entity type not specified or wrong given');
        }

        if (msg.locations && _.isArray(msg.locations) && msg.locations.length > 0) {
            locations = msg.locations;
        } else if (context.locations &&  _.isArray(context.locations) && context.locations.length > 0) {
            locations = context.locations
        } else {
            this.error('EntityEditStep: locations are not specified or wrong given');
        }

        if (msg.entries && _.isArray(msg.entries)) {
            entries = msg.entries;
        } else if (this.entries && this.entries.length > 0) {
            entries = this.entries;
        }

        if (!entries || entries.length === 0) {
            if (locations && locations.length > 0) {
                entries = locations.map((wsid) => {
                    return { id: null, wsid };
                });
            } else {
                this.error('Proceed data error: locations are not specefied');
            }
        }

        return processData(entity, msg.data, entries, api, contributions).then((res) => {
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
        const { api, contributions, entity, locations } = context;

        if (!api || !contributions || !entity) {
            this.error('Cant fetch entity item data.', api, contributions, entity);
        }

        let entries = this.buildRequestEntires(items);

        return fetchData(entity, locations, api, contributions, { entries })
            .then(({ data, Data, resolvedData }) => {
                if (resolvedData && resolvedData.length > 0) {
                    return this.checkForEmbededTypes(resolvedData[0], context);

                }
            });
    }

    checkForEmbededTypes(data, context) {
        const { contributions, entity } = context;

        if (!contributions || !entity) return data;

        const Data = { ...data };

        const pointContributions = contributions.getPointContributions('forms', entity);
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

    checkEntries(entries) {
        const resultEntries = [];

        if (!entries || entries.length <= 0) return false;

        for (let i = 0; i < entries.length; i++) {
            const { id, wsid } = entries[i];

            if (!(id > 0 && wsid > 0)) return null;

            resultEntries.push({ id, wsid });
        }

        return resultEntries;
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
