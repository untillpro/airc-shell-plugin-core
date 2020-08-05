/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';

import EMEditForm from '../EMEditForm';
import { Button, Table, Modal } from '../../../base/components';
import { ListPaginator } from '../../common/';
import { reduce } from '../../../classes/Utils';

/**
 * All API communications are realized in-component not in state machine cause of BO Reducer State intersections. 
 * 
 * To avoid this intersections it will be neccesary to create adittional state field specail to this component that in my opinion will be overkill.
 * */

class EmbeddedManagerField extends Component {
    constructor() {
        super();

        this.state = {
            data: [],
            entityData: {},
            edit: false,
            copy: false,
            entity: null,
            selectedRows: [],
            component: {},
            changedData: {},

            actions: [] // reserved
        };

        this.entity = null; // String. Name of embedded entity
    }

    componentDidMount() {
        const { value, field } = this.props;

        if (!field) throw new Error('EmbeddedManagerField exception: "field" prop not specified', field);

        const { entity } = field;

        if (!entity || typeof entity !== 'string') {
            throw new Error('EmbeddedManagerField exception: contribution prop "entity" is not defined or wrong given. String expected.', entity);
        }

        this.entity = entity;

        this.prepareProps();

        this.setState({
            data: _.map(value, (o) => o) || {}
        });
        
    }

    //actions

    actionEdit(rowIndex = null) {
        const { selectedRows } = this.state;
        const data = this.getData();

        let index = parseInt(rowIndex);

        if (!index && selectedRows && selectedRows.length > 0) {
            index = selectedRows[0];
        }

        if (index >= 0) {
            const entityData = data[index];

            if (entityData) {
                this.setState({
                    edit: true,
                    entityData
                });
            }
        }
    }

    actionCopy(rowIndex = null) {
        const { selectedRows } = this.state;
        const data = this.getData();

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
            console.log('request removing item ', index);
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

    UNSAFE_componentWillReceiveProps(newProps) {
        const { value } = newProps;

        if (value !== this.state.value) {
            const normolizedValue = _.map(value, o => o);
            this.setState({ data: normolizedValue });
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

    handleRowClick(e, row) {
        const { component } = this.state;

        if (!component.allowSelection) return;

        let index = row.index;

        this.setState({
            selectedRows: [index]
        });
    }

    handleRowDoubleClick(e ,row) {
        this.actionEdit(row.index);
    } 

    getColumns() {
        const { context } = this.props;
        const { contributions } = context;
        const { entity } = this;
        const { /* actions, */ data } = this.state;

        let columns = [];

        const entityListContributions = contributions.getPointContributions('list', entity);

        if (entityListContributions && entityListContributions.columns) {
            _.each(entityListContributions.columns, (column) => {
                if (column.dynamic) {
                    columns = [...columns, ...this.getDynamicColumns(column, data)];
                } else {
                    columns.push(column);
                }
            });
        } else {
            throw new Error(`list.columns contributions not specified for entity ${entity}`);
        }

        return columns;
    }

    getDynamicColumns(props, data) {
        const columns = {};

        if (data && data.length > 0) {
            if (props.accessor && props.generator) {
                data.forEach((item) => {
                    let value = null;

                    if (typeof props.accessor === 'string') {
                        value = item[props.accessor];
                    } else if (typeof props.accessor === 'function') {
                        value = props.accessor(item);
                    }

                    if (value) {
                        _.each(value, (val) => {
                            const column = props.generator(val);

                            if (column && column.id && !columns[column.id]) {
                                columns[column.id] = column;
                            }
                        });
                    }
                });
            }
        }

        return Object.values(columns);
    }

    prepareProps() {
        const { entity } = this;
        const { context } = this.props;
        const { contributions } = context;

        const entityListContributions = contributions.getPointContributions('list', entity);

        let component = {};
        let properties = {};

        let actions = [];

        if (entityListContributions) {
            _.each(entityListContributions, (contribution, type) => {

                switch (type) {
                    case 'actions':
                        actions = contribution;
                        break;

                    case 'table':
                        properties  = { ...properties, ...contribution[0] };
                        break;

                    case 'component':
                        component = { ...component, ...contribution[0] };
                        break;

                    default:
                        break;
                }
            });
        }

        // removing prohibited props

        delete properties.data;
        delete properties.pages;
        delete properties.loading;
        delete properties.columns;

        this.setState({
            actions,
            component,
            properties
        });
    }

    getRowClass(row) {
        const { component, selectedRows } = this.state;
        const resultClasses = [];

        if (component.allowSelection !== false) {
            resultClasses.push('-selectable');
        }

        if (row) {
            const index = row.index;

            if (selectedRows.indexOf(index) >= 0) {
                resultClasses.push('-selected');
            }
        }

        return resultClasses.join(' ');
    }

    renderHeaderActions() {
        const { disabled } = this.props;
        const { component, selectedRows: rows } = this.state;

        if (!component || !component.actions || !component.actions.length) return null;

        const result = {};

        component.actions.forEach((action) => {
            switch (action) {
                case 'add':
                    result.add = (<Button icon='plus' key='header-action-add' disabled={disabled} onClick={() => this.handleHeaderAction(action)} />);
                    break;
                case 'remove':
                    result.remove = (<Button icon='delete' key='header-action-remove' disabled={!rows.length || disabled} onClick={() => this.handleHeaderAction(action)} />);
                    break;

                case 'copy':
                    result.refresh = (<Button icon='copy' key='header-action-copy' disabled={!rows.length || disabled} onClick={() => this.handleHeaderAction(action)} />);
                    break;

                case 'edit':
                    if (!rows || rows.length <= 0) break;
                    result.edit = (<Button type='primary' key='header-action-edit' text='Edit' disabled={rows.length > 1 || disabled} onClick={() => this.handleHeaderAction(action)} />);
                    break;

                case 'massedit': break; //TODO

                default: break;
            }
        });

        return (
            <div className="header-actions">
                {Object.values(result)}
            </div>
        );
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

        console.log('Embeded edit form proceed new data:', newData);

        if (newData && _.size(newData) > 0) {
            if (i >= 0) {
                resultData[i] = { id: data[i].id, ...newData };
            } else {
                resultData[data.length] = { ...newData };
            }
        }

        console.log('Embeded edit form proceed result data:', resultData);

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
        const { entity } = this;
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
                        entity={entity}
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

        const res = [];


        if (data) {
            _.each(data, (item) => {
                if (item) {
                    res.push(item);
                }
            })
        }

        return res;
    }

    render() {
        const { entity } = this;
        const { field, disabled } = this.props;
        const { properties } = this.state;

        if (!field || !entity) return null;

        const { header } = field;

        const columns = this.getColumns();

        const data = this.getData();

        const tableConfig = {
            disabled,
            data,
            columns,
            PaginationComponent: ListPaginator,
            ...properties,
            minRows: properties.minRows || 5,
            className: disabled ? "disabled-table" : null,
            getTrProps: (state, row) => {
                if (disabled) return {};

                return {
                    onClick: (e) => this.handleRowClick(e, row),
                    onDoubleClick: (e) => this.handleRowDoubleClick(e, row),
                    className: this.getRowClass(row)
                };
            }
        };

        return (
            <div className="embedded-manager-field">
                <div className="embedded-manager-field-header">
                    <div className="grid colum-2 row-1">
                        <div className="cell align-center">
                            {header ? (<h2>{String(header)}</h2>) : ''}
                        </div>
                        <div className="cell align-right">
                            {this.renderHeaderActions()}
                        </div>
                    </div>
                </div>

                <div className="embedded-manager-field">
                    <Table 
                        disabled={disabled}
                        {...tableConfig} 
                    />
                </div>

                {this.renderEditModal()}
            </div>

        );
    }
}

export default EmbeddedManagerField;