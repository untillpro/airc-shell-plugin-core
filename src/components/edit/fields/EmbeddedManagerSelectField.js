/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';

import EmbeddedManagerField from './EmbeddedManagerField';

import {
    getCollection,
    processData
} from '../../../classes/helpers';

class EmbeddedManagerSelectField extends EmbeddedManagerField {
    initData() {
        this.setState({headerActions: this.prepareHeaderActions()});
        
        this.fetchListData().then((data) => this.setState({ data: this.buildData(data) }));
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
        const { context, locations } = this.props;
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

            //TODO use of context
            processData(context, entity, newData, entries)
                .then(() => {
                    return this.fetchListData()
                })
                .then((data) => {
                    this.setState({
                        data: this.buildData(data),
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
        const { context, locations } = this.props;
        const { entity } = this;

        if (!entity) return;

        return getCollection(context, entity, locations, {}).then(({ resolvedData }) => {
            return resolvedData;
        });
    }
}

export default EmbeddedManagerSelectField;