import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'antd';
import EMEditForm from '../EMEditForm';
import { 
    Table, 
    TableArea,
    TableAreaImageSelect, 
    TableAreaList 
} from '../../common/plan/';

import {
    EditOutlined,
    PlusOutlined,
    DeleteOutlined,
} from '@ant-design/icons';

class TablePlanEditor extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            tables: [],
            currentTable: null,
            modal: false,
            bounds: { left: 0, top: 0, right: 600, bottom: 300 },
            
            width: 0,
            height: 0,
            image: null

            //width: 600,
            //height: 300,
            //image: "https://badrequest.ru/tests/uploader/files/Beach.png"
        };

        this.changeTables = this.changeTables.bind(this);
        this.changeTable = this.changeTable.bind(this);

        this.addTable = this.addTable.bind(this);
        this.editTable = this.editTable.bind(this);
        this.removeTable = this.removeTable.bind(this);

        this.onTableClick = this.onTableClick.bind(this);
        this.onTableDoubleClick = this.onTableDoubleClick.bind(this);
        this.onTableChange = this.onTableChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);

        this.onImageChange = this.onImageChange.bind(this);
        this.onSizeChange = this.onSizeChange.bind(this);
    }

    componentDidMount() {
        const { field } = this.props;

        if (!field) throw new Error('EmbeddedManagerField exception: "field" prop not specified', field);

        const { entity } = field;

        if (!entity || typeof entity !== 'string') {
            throw new Error('EmbeddedManagerField exception: contribution prop "entity" is not defined or wrong given. String expected.', entity);
        }

        this.entity = entity;

        this.initData();
    }

    componentDidUpdate(oldProps) {
        //todo
    }

    initData() {
        this.setState({ tables: this.props.data });
    }

    initWidthHeight(imageUrl) {

    }

    changeTables(tables) {
        const { onChange } = this.props;

        this.setState({ tables });

        if (_.isFunction(onChange)) {

        }
    }

    changeTable(number) {
        this.setState({ currentTable: number || null })
    }

    addTable() {
        this.setState({ currentTable: null, modal: true });
    }

    editTable() {
        const { currentTable, tables } = this.state;

        this.setState({ modal: true });
    }

    removeTable() {
        const { currentTable, tables } = this.state;

        const temp = [...tables];
        temp.splice(currentTable, 1);

        this.setState({ tables: temp });
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
        
        const newTables = [ ...tables ];

        if (index >= 0 && tables[index]) {
            const t = tables[index];
            
            newTables[index] = { ...t, ...tableData };
        } else {
            newTables.push(tableData);
        }

        this.setState({ tables: newTables, ...ops });
    }

    onFormSubmit(tableData, index) {
        this.onTableChange(tableData, index, { modal: false});
    }

    onImageChange(data) {
        console.log("onImageChange: ", data);
        
        if (_.isPlainObject(data) && "url" in data) {
            this.setState({ image: data.url});
        }
    }

    onSizeChange(props) {
        const { width, height } = props;
        const newState = {};

        if (_.isNumber(width)) {
            newState.width = parseInt(width, 10);
        }

        if (_.isNumber(height)) {
            newState.height = parseInt(height, 10);
        }

        if (_.size(newState) > 0) {
            console.log("New table area size", newState);

            this.setState(newState);
        }
    }

    renderTables() {
        const { tables, currentTable, bounds } = this.state;

        if (!_.isArray(tables) || _.size(tables) === 0) return null;

        return _.map(tables, 
            (t, k) =>
                <Table
                    {...t}
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
                title="Add table"
                visible
                onCancel={() => this.setState({ modal: false })}
                footer={null}
            >
                {
                    <EMEditForm
                        entity={this.entity}
                        isNew={isNew}
                        data={data}
                        onProceed={(newData) => this.onEditFormProceed(!isNew ? current : null, newData)}
                        locations={locations}
                    />
                }
            </Modal>
        );
    }

    renderNavActions() {
        const { currentTable } = this.state;

        return (
            <div className="actions">
                <Button
                    className="action"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={this.addTable}
                />

                <Button
                    className="action"
                    icon={<EditOutlined />}
                    disabled={currentTable == null}
                    onClick={this.editTable}
                />

                <Button
                    className="action"
                    icon={<DeleteOutlined />}
                    disabled={currentTable == null}
                    onClick={this.removeTable}
                />
            </div>
        );
    }

    render() {
        const { tables, currentTable, width, height, image } = this.state;

        return (
            <div className="table-plan-editor">
                <div className="table-plan-editor-nav">
                    {this.renderNavActions()}
                </div>

                <div className="table-plan-editor-container">
                    {image ? (
                        <>
                            <TableAreaList 
                                onAdd={this.addTable}
                                data={tables}
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
