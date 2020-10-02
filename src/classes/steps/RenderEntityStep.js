/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import StateMachineStep from '../StateMachineStep';
import { MessageInit, MessageNotify } from '../messages';
import EntityEditStep from './EntityEditStep';
//import EntityMassEditStep from './EntityMassEditStep';

import {
    getCollection,
    processData,
    checkEntries,
    //checkEntry
} from '../EntityUtils';

const INITIAL_STATE = {
    data: [],
    resolvedData: [],
    manual: false,
    showDeleted: false,
    total: 0,
    page: 0,
    pages: -1,
    pageSize: 20,
    order: [
        {
            id: "id",
            desc: false
        }
    ],
    filter: [],
}

class RenderEntityStep extends StateMachineStep {
    constructor(...args) {
        super(args);

        _.each(INITIAL_STATE, (value, param) => {
            this[param] = value;
        });
    }

    getName() {
        return 'RenderEntityStep';
    }

    async MessageInit(msg, context) {
        const { contributions } = context;
        if (msg.entity && typeof msg.entity === 'string') {
            this.entity = msg.entity;

            this.manual = !!contributions.getPointContributionValue('list', this.entity, 'manual');

            return this.fetchListData(context);
        }

        throw new Error('RenderEntityStep.MessageInit() exception: entity not defined');
    }

    async MessageNotify(msg, context) {
        if (msg.refresh) {
            return this.fetchListData(context);
        } else {
            return {
                changedData: {
                    list: this.list()
                }
            };
        }
    }

    async MessageNeedEdit(msg) {
        const { entries: sourceEntries, copy } = msg;

        let entries = null;
        
        if (_.isArray(sourceEntries)) {
            entries = checkEntries(sourceEntries);
        }

        return {
            message: new MessageInit({ entries, copy: !!copy }),
            newStep: new EntityEditStep()
        };
    }

    async MessageNeedMassEdit() {
        throw Error("RenderEntityStep.MessageNeedMassEdit() not implemented yet;")

        /*
        return {
            message: new MessageInit(),
            newStep: new EntityMassEditStep()
        };
        */
    }

    async MessageCancel() {
        return {
            pop: true,
            message: new MessageNotify(),
        };
    }

    async MessageRefreshListData(msg, context) {
        return await this.fetchListData(context);
    }

    async MessageSetItemState(msg, context) {
        const { api, contributions } = context;
        const { entry, state } = msg;
        const { entity } = this;

        if (!entry) this.error('Error occured while MessageDeleteItem(): entry not specified', msg);
        if (!api || !contributions) this.error('Can\'t fetch entity item data.', api, contributions);
        if (!entity) this.error('Entity are not specified.', entity);

        const entries = checkEntries([entry]);

        if (entries.length === 0) return;

        return processData(context, entity, { state }, entries).then((res) => {
            if (res && _.isArray(res) && res.length > 0) {
                _.each(res, (d) => {
                    if (d && d.result === "ok" && d.ID && d.ID > 0) {
                        const index = _.findIndex(this.resolvedData, o => o.id === d.ID);

                        if (index >= 0) {
                            this.resolvedData[index] = { ...this.resolvedData[index], state };
                        };
                    }
                });

                if (this.manual) {
                    return this.fetchListData(context);
                } else {
                    return {
                        changedData: {
                            list: this.list()
                        }
                    }
                }
            }
        });
    }

    async MessageSetPage(msg, context) {
        const { page } = msg;

        if (page >= 0 && typeof page === 'number') {
            this.page = page;
        }

        if (this.manual) {
            return this.fetchListData(context);
        }

        return {
            changedData: {
                list: this.list()
            }
        }
    }

    async MessageSetPageSize(msg, context) {

        const { pageSize } = msg;

        if (pageSize && typeof pageSize === 'number') {
            this.pageSize = pageSize;
            this.page = 0;
        }

        if (this.manual) {
            return this.fetchListData(context);
        }

        return {
            changedData: {
                list: this.list()
            }
        }
    }

    async MessageSetShowDeleted(msg, context) {
        const { showDeleted } = msg;

        this.showDeleted = !!showDeleted;

        if (this.manual) {
            return this.fetchListData(context);
        }

        return {
            changedData: {
                list: this.list()
            }
        }
    }

    async MessageSetOrder(msg, context) {
        const { order } = msg;

        if (order) {
            this.order = order;
        }

        if (this.manual) {
            return this.fetchListData(context);
        }

        return {
            changedData: {
                list: this.list()
            }
        }
    }

    async MessageSetFilter(msg, context) {
        this.filter = {};

        if (this.manual) {
            return this.fetchListData(context);
        }

        return {
            changedData: {
                list: this.list()
            }
        }
    }

    //TODO remove state from context; init entity and locations in InitMessage
    async MessageNeedNavigation(msg, context) {
        /*
            TODO for manual mode - в том плане, что если навигацией достигается конец resolvedData, то для мануального режима надо попробовать взять 
            следующую страницу, и если это удается, то переписать переменные в степе, включая data и resolvedData
        */

        const { entityData } = context.state;
        const { id } = msg;

        let prev = null;
        let next = null;

        if (id && id > 0 && this.resolvedData && this.resolvedData.length > 0) {
            const data = this.resolvedData;

            const index = _.findIndex(data, (o) => { return o.id === id; });

            if (index >= 0) {
                if (index > 0) {
                    prev = data[index - 1].id;
                }

                if (data[index + 1]) {
                    next = data[index + 1].id;
                }
            }
        }

        return {
            changedData: {
                entityData: {
                    ...entityData,
                    prev,
                    next
                }
            }
        };
    }

    //TODO remove state from context; init entity and locations in InitMessage
    async fetchListData(context) {
        const { entity, page, pageSize, showDeleted, manual } = this;
        const { state, contributions } = context;
        const { locations } = state;

        if (!locations || (!_.isNumber(locations) && !_.isArray(locations))) {
            this.error('MessageFetchListData error: locations are not specified or wrong given.')
        }

        const wsid = _.isArray(locations) ? locations : [locations];

        let doProps = {
            required_fields: contributions.getPointContributionValues('collection', entity, 'required_fields'),
            required_classifiers: contributions.getPointContributionValues('collection', entity, 'required_classifiers')
        };

        if (manual) {
            //if ReactTable works in server-side mode page and pageeSize should be sent to server
            doProps = {
                ...doProps,
                show_deleted: showDeleted ? 0 : 1,
                page: page + 1,
                page_size: pageSize,
                //order_by: {} //TODO
            };
        }


        try {
            return getCollection(context, entity, wsid, doProps)
                .then((response) => {
                    const { data, resolvedData, Data } = response;

                    this.resolvedData = resolvedData || {};
                    this.data = data || {};

                    if (Data && typeof Data === "object") {
                        let t = _.get(Data, ["meta", "total"]);

                        if (t && t > 0 && pageSize > 0) {
                            this.total = parseInt(t);
                            this.pages = Math.ceil(t / pageSize);
                        } else {
                            this.pages = 0;
                        }
                    }

                    return {
                        changedData: {
                            list: this.list()
                        }
                    };
                })
                .catch((e) => {
                    this.error(e)
                    this.pages = -1;
                    this.data = [];

                    return {
                        changedData: {
                            list: this.list()
                        }
                    };
                });
        } catch (e) {
            console.error(e);
            this.error(e.toString());
        }
    }

    buildData(items) {
        let data = [];
        const { showDeleted } = this;

        if (items && _.size(items) > 0) {
            if (!showDeleted) {
                _.each(items, (o) => {
                    if (o.state === 1) data.push(o);
                });
            } else {
                data = _.map(items, o => o);
            }
        }

        return data;
    }

    list() {
        const {
            page,
            pageSize,
            pages,
            total,
            manual,
            resolvedData,
            showDeleted,
            order
        } = this;

        return {
            page,
            pageSize,
            pages,
            total,
            manual,
            data: this.buildData(resolvedData),
            showDeleted,
            order
        };
    }

    drop() {
        return { ...INITIAL_STATE };
    }

    detouch() {
        return {
            list: this.drop()
        };
    }
}

export default RenderEntityStep; 
