/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';

import EmbeddedManagerField from './EmbeddedManagerField';

import {
    fetchData,
    processData
} from 'classes/EntityUtils';

class EmbeddedManagerSelectField extends EmbeddedManagerField {
    componentDidMount() {
        const { field } = this.props;

        if (!field) { 
            throw new Error('EmbeddedManagerSelectField exception: "field" prop not specified', field); 
        }

        const { entity } = field;

        if (!entity || typeof entity !== 'string') {
            throw new Error('EmbeddedManagerSelectField exception: contribution prop "entity" is not defined or wrong given. String expected.', entity);
        }

        this.entity = entity;

        this.prepareProps();

        this.fetchListData().then((data) => this.setState({ data }));
    }

    handleRowDoubleClick(e ,row) {
        const { onRowSelect } = this.props;

        if (onRowSelect && typeof onRowSelect === 'function') {
            onRowSelect(row.original);
        } else {
            this.actionEdit(row.index);
        }
    } 

    actionRemove(rowIndex = null) {
        const { selectedRows, data } = this.state;

        let index = parseInt(rowIndex);

        if (!index && selectedRows && selectedRows.length > 0) {
            index = selectedRows[0];
        }

        if (index >= 0 && data[index]) {
            const newData = { ...data };
            newData[index].state = 0;
            this.setState({ data: newData });
        }
    }

    onEditFormProceed(index = null, newData) {
        const { locations, api, contributions } = this.props;
        const { entity } = this;
        const { data } = this.state;

        let id = null;

        const i = parseInt(index);

        let resultData = [ ...data ];

        if (i >= 0 && data[i].id) id = Number(data[i].id);

        if (newData && _.size(newData) > 0) {
            const entries = locations.map((wsid) => {
                return { id, wsid };
            });

            processData(entity, newData, entries, api, contributions)
                .then(() => {
                    return this.fetchListData()
                })
                .then((data) => {
                    this.setState({
                        data,
                        edit: false,
                        copy: false,
                        entityData: null
                    });
                });
        }

        if (resultData !== data) {
            this.handleChange(resultData);
        }
    }

    doSelect() {
        const { onRowSelect, field } = this.props;
        const { selectedRows, data } = this.state;

        if (onRowSelect && typeof onRowSelect === 'function') {
            if (selectedRows && selectedRows.length > 0) {
                const index = parseInt(selectedRows[0]);

                if (index >= 0) {
                    const row = data[index];

                    if (row) {
                        onRowSelect(row);
                    }
                } else {
                    console.error('No data returned by index: ', index);
                }
            } 
        } else {
            console.error('EmbeddedManagerSelectField.doSelect() exception: "onRowSelect" prop not specified or wrong given', field);
            throw new Error('EmbeddedManagerSelectField.doSelect() exception: "onRowSelect" prop not specified or wrong given');
        }
    }

    async fetchListData() {
        const { api, contributions, locations } = this.props;
        const { entity } = this;

        if (!entity) return;

        const props = {
            wsid: locations
        };

        return fetchData(entity, api, contributions, props).then(({ resolvedData }) => {
            return resolvedData;
        });
    }

}

export default EmbeddedManagerSelectField;