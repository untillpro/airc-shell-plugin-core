/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import EMEditForm from '../EMEditForm';
import { Modal } from '../../../base/components';
import { reduce } from '../../../classes/Utils';
import { ListTable } from '../../common';
import isEqual from 'react-fast-compare'
import log from '../../../classes/Log';

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

    initData() {
        const { value } = this.props;

        const headerActions = this.prepareHeaderActions();

        this.setState({
            data: this.buildData(value),
            headerActions
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

    componentDidUpdate(oldProps) {
        const { value } = this.props;

        if (!isEqual(value, oldProps.value)) {
            this.setState({ data: this.buildData(value) });
        }
    }

    //actions

    actionEdit(rowIndex = null) {
        const { data, selectedRows } = this.state;

        let index = parseInt(rowIndex);

        if (!index && selectedRows && selectedRows.length > 0) {
            index = selectedRows[0];
        }

        if (index >= 0) {
            const entityData = { ...data[index] };

            if (entityData) {
                this.setState({
                    edit: true,
                    entityData
                });
            }
        }
    }

    actionCopy(rowIndex = null) {
        const { selectedRows, data } = this.state;
        let index = parseInt(rowIndex);

        if (!index && selectedRows && selectedRows.length > 0) {
            index = selectedRows[0];
        }

        if (index >= 0) {
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
                        entityData: d
                    })
                }
            }
        }
    }

    actionRemove(rowIndex = null) {
        const { selectedRows } = this.state;

        let index = parseInt(rowIndex);

        if (!index && selectedRows && selectedRows.length > 0) {
            index = selectedRows[0];
        }

        if (index >= 0) {
            log('request removing item ', index);
            this.onEditFormProceed(index, {state: 0});
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
            case 'remove': this.actionRemove(); break;
            default: break;
        }
    }

    handleRowDoubleClick(e ,row) {
        this.actionEdit(row.index);
    } 

    handleSelectedRowsChange(rows) {
        this.setState({selectedRows: rows})
    }

    handleShowDeletedChange(val) {
        this.setState({showDeleted: val});
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

    onEditFormProceed(index = null, newData) {
        const { data } = this.state;

        const newState = {
            edit: false,
            copy: false,
            entityData: null
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
        const { edit, copy, entityData, selectedRows } = this.state;

        if (edit) {
            const rowIndex = selectedRows && selectedRows.length > 0 ? selectedRows[0] : null;
            
            return (
                <Modal
                    visible
                    footer={null}
                    onCancel={this.onEditFormCancel.bind(this)}
                    size="medium"
                >
                    <EMEditForm
                        index={rowIndex}
                        entity={this.entity}
                        isCopy={copy}
                        isNew={!(selectedRows.length > 0)}
                        data={entityData}
                        onProceed={(newData) => this.onEditFormProceed(!copy ? rowIndex : null, newData)}
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
        const { disabled } = this.props;
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
                    manual={false}
                    showDeleted={showDeleted}

                    {...tableConfig} 

                    onDoubleClick={this.handleRowDoubleClick}
                    onSelectedChange={this.handleSelectedRowsChange} 
                    onShowDeletedChanged={this.handleShowDeletedChange}
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