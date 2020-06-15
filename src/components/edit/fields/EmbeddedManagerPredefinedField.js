/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React from 'react';

import { Button } from '../../../base/components';
import EmbeddedManagerField from './EmbeddedManagerField';

import {
    buildData,
    getEntityFields
} from '../../../classes/EntityUtils';

/**
 * All API communications are realized in-component not in state machine cause of BO Reducer State intersections. 
 * 
 * To avoid this intersections it will be neccesary to create adittional state field specail to this component that in my opinion will be overkill.
 * */

class EmbeddedManagerPredefinedField extends EmbeddedManagerField {
    componentDidMount() {
        const { value, field } = this.props;
        if (!field) throw new Error('EmbeddedManagerPredefinedField exception: "field" prop not specified', field);

        const { entity } = field;

        if (!entity || typeof entity !== 'string') {
            throw new Error('EmbeddedManagerPredefinedField exception: contribution prop "entity" is not defined or wrong given. String expected.', entity);
        }

        this.entity = entity;

        this.prepareProps();

        this.fetchDependencyData()
            .then((res) => {
                this.setState({
                    data: _.map(value, (o) => o) || [],
                    dep_data: this.buildDefaultData(res) || []
                });
            });
    }

    buildDefaultData(data) {
        //if (!data || !data.length <= 0) return null;

        const result = [];
        const { contributions, field } = this.props;
        const { entity, depended_entity } = field;
        
        const defaultObject = {};

        const fields = getEntityFields(entity, contributions);

        if (fields) {
            _.each(fields, (field, key) => {
                defaultObject[field.accessor] = field.value !== undefined ? field.value : null;
            });

            _.each(data, (val) => {
                result.push(
                    { 
                        ...defaultObject,
                        [`id_${depended_entity}`]: val
                    }
                );
            });
        }

        return result;
    }

    async fetchDependencyData() {
        const { field, entity, locations } = this.props;
        const { accessor, depended_entity } = field;

        if (!depended_entity || typeof depended_entity !== "string") {
            throw new Error(`"${entity}" declaration error: you should specify "depended_entity" prop in "${accessor}" field declaration.`);
        }

        return this.fetchData(depended_entity).then((Data) => {            
            return buildData(Data, locations);
        });
    }

    async fetchData(entity) {
        const { api, contributions, locations } = this.props;
        let loc = null;
        if (!entity) return {};

        const url = contributions.getPointContributionValue('url', entity, 'getUrl')

        if (!url || !url.queue || !url.resource) {
            throw new Error(`EmbeddedManagerPredefinedField.fetchData() exception: "getUrl" param for "${entity}" entity not specified or wrong given`);
        }

        if (locations) {
            loc = _.isArray(locations) ? locations[0] : parseInt(locations);
        }

        if (!loc || loc <= 0) {
            throw new Error(`EmbeddedManagerPredefinedField.fetchData() exception: location not specified or wrong given`);
        }

        return  api.collection(url.resource, [ loc ], {});
    }


    onEditFormProceed(index = null, newData) {
        const { data } = this.state;
        const listData = this.getData();

        const rowData = listData[index];
        
        const newState = {
            edit: false,
            copy: false,
            entityData: null
        };

        let resultData = [];


        if (rowData && newData && _.size(newData) > 0) {

            const resultRowData = { ...rowData, ...newData };

            if (resultRowData.id && resultRowData.id > 0) {
                _.each(data, (row) => {
                    if (row.id === resultRowData.id) {
                        resultData.push({...row, ...resultRowData});
                    } else {
                        resultData.push(row);
                    }
                });
            } else {
                resultData = _.concat(data, resultRowData);
            }
        }

        if (resultData !== data) {
            this.handleChange(resultData);
        }

        this.setState(newState);
    }

    getData() {
        const { data, dep_data } = this.state;
        const { field } = this.props;
        const { depended_entity } = field;

        if (!data || data.length <= 0) return dep_data;

        const resData = [ ...data ];

        _.each(dep_data, (obj) => {
            const k = `id_${depended_entity}.id`;
            const id = _.get(obj, k);

            const i = _.findIndex(data, (o) => {
                const oid = _.get(o, k);

                return oid === id;
            });

            if (i < 0) resData.push(obj);
        });

        return resData;
    }

    renderHeaderActions() {
        const { selectedRows: rows } = this.state;

        return (
            <div className="header-actions">
                <Button type='primary' key='header-action-edit' text='Advanced settings' disabled={rows.length !== 1} onClick={() => this.actionEdit()} />
            </div>
        );
    }
}

export default EmbeddedManagerPredefinedField;