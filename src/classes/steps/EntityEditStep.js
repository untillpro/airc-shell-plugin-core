/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';

import StateMachineStep from '../StateMachineStep';
import { Logger } from 'airc-shell-core';
import { MessageInit, MessageNotify } from '../messages';

import {
    isValidLocations,
    isValidEntity,
} from '../helpers';

import {
    TYPE_COLLECTION,
    C_COLLECTION_ENTITY,
} from '../contributions/Types';

import { 
    FLUSH_ENTITY_DATA,
} from '../../actions/Types';

import { 
    SAGA_FETCH_ENTITY_DATA,
    SAGA_PROCESS_ENTITY_DATA,
} from '../../sagas/Types';

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

    MessageInit(msg, context) {
        const { contributions } = context;
        const { entries, copy, entity, locations } = msg;

        if (!isValidEntity(context, entity)) {
            this.error(this.getName() + '.MessageInit() exception: entity not specified or wrong given: ' + entity.toString());
        }

        if (!isValidLocations(locations)) {
            this.error(this.getName() + '.MessageInit() exception: locations not specified or wrong given: ' + locations.toString());
        }

        Logger.log("EntityEditStep.MessageInit(): ", entries);

        this.entity = entity;
        this.locations = locations;
        this.entries = entries;

        let resource = contributions.getPointContributionValue(TYPE_COLLECTION, entity, C_COLLECTION_ENTITY) || entity;

        return {
            action: {
                type: SAGA_FETCH_ENTITY_DATA,
                payload: {
                    resource,
                    isCopy: !!copy,
                    entries
                }
            }
        };
    }

    MessageNeedEdit(msg) {
        return {
            pop: true,
            message: new MessageInit(msg),
            newStep: new EntityEditStep()
        };
    }

    MessageCancel(msg) {
        const { refresh } = msg;

        return {
            pop: true,
            message: new MessageNotify({ refresh: !!refresh }),
            action: {
                type: FLUSH_ENTITY_DATA
            }
        };
    }

    MessageProceed(msg, context) {
        let { entries, entity, locations } = this;
        const { data } = msg;

        Logger.log(entries, "=================================== MessageProceed: Entries: ");

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

        return {
            action: {
                type: SAGA_PROCESS_ENTITY_DATA,
                payload: {
                    entity, data, entries
                }
            }
        };
    }

    MessageValidate(msg, context) {
        return null;
    }

    detouch() {
        return {
            action: {
                type: FLUSH_ENTITY_DATA
            }
        };
    }
}

export default EntityEditStep; 
