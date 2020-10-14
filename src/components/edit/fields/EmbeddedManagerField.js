/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import EMEditForm from '../EMEditForm';
import { Modal } from '../../../base/components';
import { reduce } from '../../../classes/helpers';
import { ListTable } from '../../common';
import isEqual from 'react-fast-compare'
//import log from '../../../classes/Log';

/**
 * All API communications are realized in-component not in state machine cause of BO Reducer State intersections. 
 * 
 * To avoid this intersections it will be neccesary to create adittional state field specail to this component that in my opinion will be overkill.
 * */
const DEFAULT_MINIMUM_ROWS = 5;

class EmbeddedManagerField extends Component {
    constructor() {
        super();

        this.state = {
            current: null,
            data: [],
            entityData: {},
            edit: false,
            copy: false,
            selectedRows: [],
            component: {},
            changedData: {},
            showDeleted: false,
            rowActions: [], // reserved
            headerActions: []
        };

        this.entity = null;

        this.handleRowDoubleClick = this.handleRowDoubleClick.bind(this);
        this.handleSelectedRowsChange = this.handleSelectedRowsChange.bind(this);
        this.handleShowDeletedChange = this.handleShowDeletedChange.bind(this);
        this.handleValueSave = this.handleValueSave.bind(this);
        this.handleEnterPress = this.handleEnterPress.bind(this);
    }

    componentDidMount() {
        const { field } = this.props;

        if (!field) throw new Error('EmbeddedManagerField exception: "field" prop not specified', field);

        const { entity } = field;

        if (!entity || typeof entity !== 'string') {
            throw new Error('EmbeddedManagerField exception: contribution prop "entity" is not defined or wrong given. String expected.', entity);
        }

        this.entity = entity;

        this.initData()
    }

    componentDidUpdate(oldProps, oldState) {
        const { value } = this.props;

        if (
            !isEqual(value, oldProps.value) ||
            !isEqual(this.state.showDeleted, oldState.showDeleted)
        ) {
            this.setState({ data: this.buildData(value) });
        }
    }

    async initData() {
        const { value } = this.props;

        const headerActions = this.prepareHeaderActions();
        const rowActions = this.prepareRowActions();

        this.setState({
            data: this.buildData(value),
            headerActions,
            rowActions
        });
    }

    buildData(sourceData) {
        const { showDeleted } = this.state;
        const res = [];

        if (sourceData && typeof sourceData === 'object') {
            _.forEach(sourceData, (row) => {
                if (row && (showDeleted || row.state === 1)) {
                    res.push(row);
                }
            });
        }

        return res;
    }

    //actions

    actionEdit(rowIndex = null) {
        const { selectedRows, data } = this.state;

        let index = parseInt(rowIndex);

        if (!_.isNumber(index) && selectedRows && selectedRows.length > 0) {
            index = parseInt(selectedRows[0]);
        }

        if (index >= 0) {
            const entityData = { ...data[index] };

            if (entityData) {
                this.setState({
                    edit: true,
                    entityData,
                    current: index
                });
            }
        }
    }

    actionCopy(rowIndex = null) {
        const { selectedRows, data } = this.state;
        let index = parseInt(rowIndex);

        if (!index && selectedRows && selectedRows.length > 0) {
            index = parseInt(selectedRows[0]);
        }

        if (index) {
            const entityData = data[index];

            if (entityData) {
                const d = reduce(
                    entityData,
                    (r, v, k) => {
                        if (k === "id") return;
                        else r[k] = v;
                    },
                    (v, k) => typeof v === 'object' && String(k).indexOf('id_') !== 0
                );

                if (d) {
                    this.setState({
                        copy: true,
                        edit: true,
                        entityData: d,
                        current: null
                    })
                }
            }
        }
    }

    actionToggle(rowIndex = null) {
        const { selectedRows, data } = this.state;

        let index = parseInt(rowIndex);

        if (!index && selectedRows && selectedRows.length > 0) {
            index = parseInt(selectedRows[0]);
        }

        if (index) {
            const flatRow = data[index];
            console.log("flatRow: ", flatRow);

            if (flatRow && typeof flatRow === 'object') {
                this.onEditFormProceed(index, { state: flatRow.state === 0 ? 1 : 0 });
            } else {
                this.onEditFormProceed(index, { state: 0 });
            }
        }
    }

    actionAdd() {
        this.setState({
            edit: true,
            selectedRows: [],
            entityData: {}
        });
    }

    //***********

    handleChange(value) {
        const { onChange } = this.props;

        console.log("EmbeddedManagerField.handleChange: ", value);
        if (onChange && typeof onChange === 'function') {
            onChange(value);
        }
    }

    handleHeaderAction(action) {
        const { disabled } = this.props;

        if (disabled) return;

        switch (action) {
            case 'add': this.actionAdd(); break;
            case 'edit': this.actionEdit(); break;
            case 'copy': this.actionCopy(); break;
            case 'remove': this.actionToggle(); break;
            default: break;
        }
    }

    handleEnterPress() {
        console.log("EmbeddedManagerField.handleEnterPress()");
        this.actionEdit()
    }

    handleRowDoubleClick(e, row) {
        console.log("EmbeddedManagerField.handleRowDoubleClick(): ", row);
        this.actionEdit(row.index);
    }

    handleSelectedRowsChange(rows, flatRows) {
        console.log("EmbeddedManagerField.handleSelectedRowsChange(): ", rows);
        this.setState({ selectedRows: rows });
    }

    handleShowDeletedChange(val) {
        console.log("EmbeddedManagerField.handleShowDeletedChange(): ", val);
        this.setState({ showDeleted: val });
    }

    async handleValueSave(value, prop, entry, cell) {
       const index = cell ? cell.index : null;

        if (_.isNumber(index) && index >= 0 && entry && _.isPlainObject(entry) && cell && _.isPlainObject(cell)) {
            const res = [];

            res[index] = { [prop]: value, id: entry.id };

            this.handleChange(res);
        }
    }

    handleAction(row, type) {
        const { index } = row;

        switch (type) {
            case 'edit':
                this.actionEdit(index);
                break;

            case 'copy':
                this.actionCopy(index);
                break;

            case 'remove':
                this.actionToggle(index);
                break;

            default: break;
        }

        return false;
    }

    prepareHeaderActions() {
        const { context } = this.props;
        const { contributions } = context;

        if (!contributions) return [];

        const res = [];
        const component = contributions.getPointContributionValue('list', this.entity, 'component');

        if (_.isPlainObject(component)) {
            const actions = component.actions;

            if (_.isArray(actions)) {
                _.forEach(actions, (type) => {
                    const r = this.prepareHeaderAction(type);

                    if (r) {
                        res.push(r);
                    }
                });
            }
        }

        return res;
    }

    prepareHeaderAction(actionType) {
        const { disabled } = this.props;

        if (!actionType || typeof actionType != "string") return null;

        switch (actionType) {
            case 'add':
                return {
                    buttonType: "icon",
                    icon: 'plus',
                    key: 'header-action-add',
                    disabled: disabled,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'remove':
                return {
                    buttonType: "icon",
                    icon: 'delete',
                    key: 'header-action-remove',
                    disabled: disabled ? disabled : (rows) => !rows.length,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'copy':
                return {
                    buttonType: "icon",
                    icon: 'copy',
                    key: 'header-action-copy',
                    disabled: disabled ? disabled : (rows) => !rows.length,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'edit':
                return {
                    buttonType: "simple",
                    type: 'primary',
                    key: 'header-action-edit',
                    text: 'Edit item',
                    disabled: disabled ? disabled : (rows) => rows.length !== 1,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            default: return null;
        }
    }

    prepareRowActions() {
        const { context } = this.props;
        const { contributions } = context;

        if (!contributions) return [];

        const res = [];
        const actions = contributions.getPointContributionValues('list', this.entity, 'actions')

        console.log('EMField.actions: ', actions);

        if (actions && _.isArray(actions) && actions.length > 0) {
            _.forEach(actions, (type) => {
                res.push({
                    type,
                    action: (data) => this.handleAction(data, type)
                })
            });
        }

        return res;
    }

    onEditFormProceed(index = null, newData) {
        const { data } = this.state;

        console.log("EmbeddedManagerField.onEditFormProceed: ", index, newData);

        const newState = {
            edit: false,
            copy: false,
            entityData: null,
            current: null
        };

        const i = parseInt(index);

        let resultData = [];

        if (newData && _.size(newData) > 0) {
            if (i >= 0) {
                resultData[i] = { id: data[i].id, ...newData };
            } else {
                resultData[data.length] = { ...newData };
            }
        }

        this.handleChange(resultData);

        this.setState(newState);
    }

    onEditFormCancel() {
        this.setState({
            edit: false,
            copy: false,
            entityData: {}
        });
    }

    renderEditModal() {
        const { locations } = this.props;
        const { edit, copy, entityData, current } = this.state;

        if (edit) {
            return (
                <Modal
                    visible
                    footer={null}
                    onCancel={this.onEditFormCancel.bind(this)}
                    size="medium"
                >
                    <EMEditForm
                        entity={this.entity}
                        isCopy={copy}
                        isNew={!(current >= 0)}
                        data={entityData}
                        onProceed={(newData) => this.onEditFormProceed(!copy ? current : null, newData)}
                        locations={locations}
                    />
                </Modal>
            );
        }

        return null;
    }

    getData() {
        const { data } = this.state;

        return data;
    }

    render() {
        const { disabled, classifiers } = this.props;
        const { properties, rowActions, headerActions, showDeleted } = this.state;

        if (!this.entity) return null;

        const tableConfig = {
            disabled,
            minRows: DEFAULT_MINIMUM_ROWS,
            ...properties,
            className: disabled ? "disabled-table" : null
        };



        return (
            <div className="embedded-manager-field">
                <ListTable
                    entity={this.entity}
                    data={this.getData()}
                    classifiers={classifiers}
                    manual={false}
                    showDeleted={showDeleted}

                    {...tableConfig}

                    onEnterPress={this.handleEnterPress}
                    onDoubleClick={this.handleRowDoubleClick}
                    onSelectedChange={this.handleSelectedRowsChange}
                    onShowDeletedChanged={this.handleShowDeletedChange}
                    onValueSave={this.handleValueSave}
                    rowActions={rowActions}
                    headerActions={headerActions}
                    
                />

                {this.renderEditModal()}
            </div>
        );
    }
}

EmbeddedManagerField.propTypes = {
    rowActions: PropTypes.arrayOf(PropTypes.object),
    headerActions: PropTypes.arrayOf(PropTypes.object),
}

export default EmbeddedManagerField;