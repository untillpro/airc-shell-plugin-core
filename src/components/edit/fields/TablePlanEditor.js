/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Popconfirm, InputNumber } from 'antd';
import { Modal, translate as t } from 'airc-shell-core';
import EMEditForm from '../EMEditForm';
import {
    Table,
    TableArea,
    TableAreaImageSelect,
    TableAreaList
} from '../../common/plan/';

import {
    PlusOutlined,
    DeleteOutlined,
} from '@ant-design/icons';

import {
    MIN_PLAN_WIDTH,
    MIN_PLAN_HEIGHT,
    SIZE_INPUT_STEP
} from '../../../const';

import { funcOrString } from '../../../classes/helpers';

class TablePlanEditor extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            tables: [],
            currentTable: null,
            modal: false,

            width: 0,
            height: 0,
            image: null,

            maxBoundRight: 0,
            maxBoundBottom: 0,
        };

        this.changeTables = this.changeTables.bind(this);

        this.addTable = this.addTable.bind(this);
        this.editTable = this.editTable.bind(this);
        this.removeTable = this.removeTable.bind(this);
        this.clearImage = this.clearImage.bind(this);

        this.onTableClick = this.onTableClick.bind(this);
        this.onTableDoubleClick = this.onTableDoubleClick.bind(this);
        this.onTableChange = this.onTableChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);

        this.onImageChange = this.onImageChange.bind(this);
        this.onSizeChange = this.onSizeChange.bind(this);

        this.handleCancel = this.handleCancel.bind(this);
    }

    componentDidMount() {
        const { field } = this.props;

        if (!field) throw new Error('EmbeddedManagerField exception: "field" prop not specified', field);

        const { entity } = field;

        if (!entity || typeof entity !== 'string') {
            throw new Error('EmbeddedManagerField exception: contribution prop "entity" is not defined or wrong given. String expected.', entity);
        }

        this.entity = entity;

        this._initData();
    }

    componentDidUpdate(oldProps) {
        const { data, field } = this.props;
        const { width_accessor, height_accessor, image_accessor } = field;

        const newState = {};

        let width, height, image;

        if (_.isString(width_accessor)) {
            width = data[width_accessor];
        }

        if (_.isString(height_accessor)) {
            height = data[height_accessor];
        }

        if (_.isString(image_accessor)) {
            image = data[image_accessor];
        }

        if (image && image !== this.state.image) {
            newState.image = image;
        }

        if (width && width !== this.state.width) {
            newState.width = width;
        }

        if (height && height !== this.state.height) {
            newState.height = height;
        }

        if (_.size(newState) > 0) {
            this.setState(newState);
        }
    }

    _initData() {
        const { value, data, field } = this.props;
        const { width_accessor, height_accessor, image_accessor } = field;

        const newState = {};

        if (_.isArray(value) && _.size(value) > 0) {
            newState.tables = value;
        }

        if (_.isString(width_accessor) && _.isNumber(data[width_accessor]) && data[width_accessor] > 0) {
            newState.width = data[width_accessor];
        }

        if (_.isString(height_accessor) && _.isNumber(data[height_accessor]) && data[height_accessor] > 0) {
            newState.height = data[height_accessor];
        }

        if (_.isString(image_accessor) && (_.isNumber(data[image_accessor]) || _.isString(data[image_accessor]))) {
            newState.image = data[image_accessor];
        }

        this.setState(newState);
    }

    _getBounds() {
        const { width, height } = this.state;

        return { left: 0, top: 0, right: width, bottom: height }
    }

    _getMinSizes() {
        const { tables } = this.state;

        let minWidth = 0, minHeight = 0;

        if (_.isArray(tables)) {
            tables.forEach(t => {
                if (_.isPlainObject(t)) {
                    const twidth = t.left_c + t.width + 20;
                    const theight = t.top_c + t.height + 20;

                    if (twidth && twidth > minWidth) minWidth = twidth;
                    if (theight && theight > minHeight) minHeight = theight;
                }
            });
        }

        return [minWidth, minHeight];
    }

    _isEditable() {
        const { image } = this.state;

        if (_.isNumber(image) && image > 0) {
            return true;
        }

        return false;
    }

    handleCancel() {
        this.setState({ modal: false });
    }

    changeTables(tables, ops = {}) {
        const { onChange, field } = this.props;
        const { accessor } = field;

        this.setState({ tables, ...ops });

        if (_.isString(accessor) && _.isFunction(onChange)) {
            onChange({ [accessor]: tables });
        }
    }

    addTable() {
        this.setState({ currentTable: null, modal: true });
    }

    editTable(index) {
        const { currentTable, tables } = this.state;

        let tableIndex = currentTable;

        if (_.isNumber(index) && index >= 0) {
            tableIndex = index;
        }

        if (
            !_.isNil(tableIndex) &&
            tableIndex >= 0 &&
            _.isArray(tables) &&
            tableIndex < tables.length
        ) {
            this.setState({ modal: true, currentTable: tableIndex });
        }
    }

    removeTable(index) {
        const { currentTable, tables } = this.state;

        let tableIndex = currentTable;

        if (_.isNumber(index) && index >= 0) {
            tableIndex = index;
        }

        if (
            !_.isNil(tableIndex) &&
            tableIndex >= 0 &&
            _.isArray(tables) &&
            tableIndex < tables.length
        ) {
            const newTables = [...tables];
            newTables.splice(tableIndex, 1);

            this.changeTables(newTables, {
                currentTable: currentTable === tableIndex ? null : currentTable
            });
        }
    }

    clearImage() {
        this.onImageChange(null);
    }

    onTableClick(index) {
        const { currentTable } = this.state;

        if (index >= 0) {
            if (currentTable !== index) {
                this.setState({
                    currentTable: index
                });
            }
        } else {
            this.setState({
                currentTable: null
            });
        }
    }

    onTableDoubleClick(index) {
        if (index >= 0) {
            this.setState({
                currentTable: index,
                modal: true
            });
        }
    }

    onTableChange(tableData, index, ops = {}) {
        const { tables } = this.state;

        const newTables = [...tables];

        if (index >= 0 && tables[index]) {
            const t = tables[index];

            newTables[index] = { ...t, ...tableData };
        } else {
            newTables.push(tableData);
        }

        this.setState({ tables: newTables, ...ops });

        this.changeTables(newTables, ops);
    }

    onFormSubmit(index, tableData) {
        this.onTableChange(tableData, index, { modal: false });
    }

    onImageChange(data) {
        const { onChange, field } = this.props;
        const { image_accessor } = field;

        let img = null;

        if (_.isPlainObject(data) && "url" in data) {
            img = data.id;
        }

        this.setState({ image: img });

        if (_.isString(image_accessor) && _.isFunction(onChange)) {
            onChange({ [image_accessor]: img });
        }
    }

    onSizeChange(props) {
        const { onChange, field } = this.props;
        const { width, height } = props;
        const { width_accessor, height_accessor } = field;

        const newState = {};
        const changedData = {};

        //const [minWidth, minHeight] = this._getMinSizes();

        const minWidth = MIN_PLAN_WIDTH;
        const minHeight = MIN_PLAN_HEIGHT;

        if (_.isNumber(width)) {
            newState.width = parseInt(width, 10);

            if (newState.width < minWidth) {
                newState.width = minWidth;
            }

            if (_.isString(width_accessor)) {
                changedData[width_accessor] = newState.width;
            }
        }

        if (_.isNumber(height)) {
            newState.height = parseInt(height, 10);

            if (newState.height < minHeight) {
                newState.height = minHeight;
            }

            if (_.isString(height_accessor)) {
                changedData[height_accessor] = newState.height;
            }
        }

        if (_.size(newState) > 0) {
            this.setState(newState);
        }

        if (_.size(changedData) > 0 && _.isFunction(onChange)) {
            onChange(changedData);
        }
    }

    renderTables() {
        const { context } = this.props;
        const { tables, currentTable } = this.state;

        if (!_.isArray(tables) || _.size(tables) === 0) return null;

        const bounds = this._getBounds();

        return _.map(tables,
            (t, k) =>
                <Table
                    {...t}


                    context={context}
                    key={`table_${k}`}
                    current={k === currentTable}
                    index={k}
                    onClick={this.onTableClick}
                    onDoubleClick={this.onTableDoubleClick}
                    onChange={this.onTableChange}
                    bounds={bounds}
                />
        );
    }

    renderModal() {
        const { locations } = this.props;
        const { modal, currentTable: current, tables } = this.state;

        if (modal !== true) return null;

        let data = null;

        if (current >= 0) {
            data = tables[current];
        }

        let isNew = !(_.isNumber(current) && current >= 0);

        return (
            <Modal
                title={t("Add table", "form")}
                visible
                onCancel={this.handleCancel}
                footer={null}
                size="small"
            >
                {
                    <EMEditForm
                        entity={this.entity}
                        isNew={isNew}
                        data={data}
                        onProceed={(newData) => this.onFormSubmit(!isNew ? current : null, newData)}
                        locations={locations}
                    />
                }
            </Modal>
        );
    }

    renderHeader() {
        const { field } = this.props;
        const { header } = field;

        if (header) {
            return <div className="header">{funcOrString(header)}</div>
        }

        return null;
    }

    renderSize() {
        const { width, height } = this.state;

        const changeStateProps = (val, prop) => {
            val = parseInt(val);

            if (val && val > 0) {
                this.setState({ [prop]: val });
                this.onSizeChange({ [prop]: val });
            }
        }

        const disabled = !this._isEditable();

        return (
            <div className="size">
                <label>{t("Size: ", "form")}</label>

                <InputNumber
                    step={SIZE_INPUT_STEP}
                    className="size-input"
                    value={width}
                    disabled={disabled}
                    onChange={disabled ? null : (value) => changeStateProps(value, 'width')}
                />
                <label>X</label>

                <InputNumber
                    step={SIZE_INPUT_STEP}
                    className="size-input"
                    value={height}
                    disabled={disabled}
                    onChange={disabled ? null : (value) => changeStateProps(value, 'height')}
                />
            </div>
        );

    }

    renderNavActions() {
        const disabled = !this._isEditable();

        return (
            <div className="actions">
                <Button
                    className="action"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={this.addTable}
                    disabled={disabled}
                />

                <Popconfirm
                    title={t("Are you sure to delete background image?", "form")}
                    onConfirm={this.clearImage}
                    okText={t("Yes", "common")}
                    cancelText={t("No", "common")}
                    disabled={disabled}
                >
                    <Button
                        className="action"
                        icon={<DeleteOutlined />}
                        disabled={disabled}
                    />
                </Popconfirm>
            </div>
        );
    }

    render() {
        const { context } = this.props;
        const { tables, currentTable, width, height, image } = this.state;

        const canBeEdited = this._isEditable();

        return (
            <div className="table-plan-editor _bs">
                <div className="table-plan-editor-nav">
                    {this.renderHeader()}

                    <div className="grow" />

                    {this.renderSize()}
                    {this.renderNavActions()}
                </div>

                <div className="table-plan-editor-container">
                    {canBeEdited ? (
                        <>
                            <TableAreaList
                                toggleable={false}
                                onEdit={this.editTable}
                                onAdd={this.addTable}
                                onDelete={this.removeTable}
                                tables={tables}
                                currentTable={currentTable}
                            />

                            <TableArea
                                width={width}
                                height={height}
                                image={image}
                                onSizeChange={this.onSizeChange}
                                onClick={() => this.onTableClick(null)}
                            >
                                {this.renderTables()}
                            </TableArea>
                        </>
                    ) : (
                            <TableAreaImageSelect
                                context={context}
                                setImage={this.onImageChange}
                            />
                        )}

                </div>

                {this.renderModal()}
            </div>
        );
    }
}

TablePlanEditor.propTypes = {
    tables: PropTypes.arrayOf(PropTypes.object),
    width: PropTypes.number,
    height: PropTypes.number,
    image: PropTypes.string,
};

export default TablePlanEditor;
