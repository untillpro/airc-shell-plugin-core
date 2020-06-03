/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table, Search } from '../../base/components';
import log from "../../classes/Log";

import HeaderBackButton from '../common/HeaderBackButton';

import EMListHeader from './EMListHeader';
import EMListPaginator from './EMListPaginator';
import EMListRowAction from './EMListRowAction';

import { 
    setColumnsVisibility,
    sendCancelMessage,
    sendNeedFetchListDataMessage,
    sendNeedEditFormMessage,

    setListPage,
    setListPageSize,
    setListFilter,
    setListOrder,

    saveResolvedData
} from '../../actions';

class EMList extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            columns: [],
            selectedRows: []
        };


        this.actions = [];
        this.component = {};
        this.properties = {};
    }

    componentDidMount() {
        const { data } = this.props;
        
        this.prepareProps(); 
        this.getColumns(data);
    }

    componentDidUpdate(newProps) {
        const { data, manual } = newProps;
        const { selectedRows } = this.state;
        let resState = {};

        if (this.props.data !== data) {
            if (selectedRows.length > 0) {
                let rows = [];

                _.each(selectedRows, (id, index) => {
                    const i = _.findIndex(data, (o) => o.id === id);

                    if (i >= 0) rows.push(id);
                });
                
                if (rows.length !== selectedRows.length) {
                    resState.selectedRows = rows;
                }
            }

            if (manual) {
                resState.loading = false;
            }

            if (_.size(resState) > 0) {
                this.setState(resState);
            }
        }

        
    }

    handleRowClick(event, row) {
        const { selectedRows } = this.state;
        const { component } = this;
        const { original } = row;
        const { allowMultyselect = true, allowSelection = true } = component;

        let id = null;

        event.preventDefault();
        event.stopPropagation();

        if (original && original.id) {
            id = parseInt(original.id, 10);
        }

        if (id && id > 0 && allowSelection) {
            if (allowMultyselect) {
                if (selectedRows.indexOf(id) >= 0) {
                    this.setState({ selectedRows: _.without(selectedRows, id) });
                } else {
                    this.setState({ selectedRows: [...selectedRows, id] });
                }
            } else {
                this.setState({ selectedRows: [ id ] });
            }
        }
    }

    handleRowDoubleClick(event, row) {
        const { actions, component } = this;
        
        if (actions.indexOf('edit') >= 0 || component.actions.indexOf('edit') >= 0) {
            event.stopPropagation();

            let id = null;
            const { original } = row;
    
            if (original && original.id) id = original.id;
    
            if (id && id > 0) this.props.sendNeedEditFormMessage([id]); 
        }
    }

    handleRowsSelectorChange() {
        const { selectedRows } = this.state;
        const { data } = this.props;
        const { component } = this;
        const { allowMultyselect = true } = component;

        if (data && allowMultyselect && (!selectedRows || selectedRows.length <= 0)) {
            const rows = data.map(row => row.id);

            this.setState({ selectedRows: rows });
        } else if (selectedRows && selectedRows.length > 0) {
            this.setState({
                selectedRows: []
            });
        }
    }

    handlePageChange(page) {
        const { manual } = this.props;

        this.props.setListPage(page);

        if (manual) this.setState({ loading: true });
    }

    handlePageSizeChange(pageSize, page) {
        const { manual } = this.props;

        this.props.setListPageSize(pageSize);

        if (manual) this.setState({ loading: true });
    }

    handleTableDataUpdate(data) {
        if (data && data.length > 0) {
            const resolvedData = data.map((o) => {
                return o._original;
            });

            if (resolvedData && resolvedData.length > 0) {
                //this.props.saveResolvedData(resolvedData)
            }
        } 
    }

    handleTableSortedChanged(newOrder) {
        const { manual } = this.props;

        this.props.setListOrder(newOrder);

        if (manual) this.setState({ loading: true });
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

    getColumns(data = null) {
        const { contributions, entity, columnsVisibility } = this.props;
        const { actions, component } = this;

        let columns = [];

        if (component.showPositionColum) {
            columns.push({
                'Header': () => this.renderRowsSelector(),
                'width': 40,
                'Cell': (props) => this.renderPosition(props),
                'sortable': false,
                'fixed': "left"
            });
        }
        
        const entityListContributions = contributions.getPointContributions('list', entity);

        if (entityListContributions.columns) {
            _.each(entityListContributions.columns, (column) => {
                if (column.dynamic) {
                    //columns = [...columns, ...this.getDynamicColumns(column, data)];  // TODO
                } else {
                    columns.push(column);
                }
            });
        }

        if (actions && actions.length > 0) {
            columns.push({
                'title': 'Actions',
                'width': 100,
                'render': (props) => this.renderActions(props, actions),
                "fixed": "right"
            });
        }
        
        if (columns.length > 0) {
            const visibility = {};

            columns.forEach((column) => {
                if (column.Header && typeof column.Header === 'string') {
                    visibility[column.Header] = !(columnsVisibility[column.Header] === false);
                }
            });

            this.props.setColumnsVisibility(visibility);
        }

        this.setState({ columns });

        return columns;
    }

    getRowClass(row) {
        const { selectedRows } = this.state;
        const { component } = this;
        const resultClasses = [];

        if (component.allowSelection !== false) {
            resultClasses.push('-selectable');
        }

        if (row) {
            const { original } = row;

            if (original && original.id && selectedRows.indexOf(original.id) >= 0) {
                resultClasses.push('-selected');
            }
        }

        return resultClasses.join(' ');
    }

    prepareProps() {
        const { contributions, entity } = this.props;
        const entityListContributions = contributions.getPointContributions('list', entity);

        let componentProps = {};

        let tableProps = {};

        let actions = [];

        if (entityListContributions) {
            _.each(entityListContributions, (contribution, type) => {

                switch (type) {
                    case 'table':
                        tableProps  = { ...tableProps, ...contribution[0] };
                        break;

                    case 'component':
                        componentProps  = { ...componentProps, ...contribution[0] };
                        break;

                    case 'actions':
                        actions = contribution;
                        break;

                    default: 
                        break;
                }
            });
        }

        const props = tableProps;

        // removing prohibited props

        delete props.data;
        delete props.pages;
        delete props.loading;
        delete props.columns;

        this.properties = tableProps;
        this.component = componentProps;
        this.actions = actions;
    }

    renderRowsSelector() {
        const { selectedRows } = this.state;
        const { component } = this;
        const { allowSelection = true } = component;

        if (allowSelection) {
            return (
                <input 
                    type='checkbox' 
                    onChange={(event) => this.handleRowsSelectorChange(event)}
                    checked={selectedRows.length > 0}
                />
            );
        }

        return null;
    }

    renderPosition(row) {
        const { page, pageSize, manual} = this.props;
        const { selectedRows } = this.state;
        const { original } = row;
        
        let id = null;

        if (original && original.id) {
            id = parseInt(original.id, 10);
        }

        if (id > 0) {
            if (selectedRows.indexOf(id) >= 0) {
                return (
                    <input 
                        className={'small'}
                        key={`row_${id}`}
                        type='checkbox' 
                        onChange={(e) => this.handleRowClick(e, row)} 
                        checked
                    />
                );   
            }
        }

        let index = row.index + 1;

        if (manual) index += page * pageSize;

        return index;
    }

    renderActions(props, actions) {
        const { entity } = this.props;
        
        return actions.map((action) => {
            return (
                <EMListRowAction 
                    key={`action_${action}`}
                    type={action} 
                    entity={entity} 
                    data={props.original}
                />
            );
        });
    }

    renderEntityName() {
        const { entity, contributions } = this.props;

        if (entity) {
            const name = contributions.getPointContributionValue('entities', entity, 'name');

            if (name) {
                return name;
            }
        }

        return '<Noname>'; //todo default name.
    }

    render() { 
        log('%c Render Table List', 'color: green; font-size: 120%');

        const { columnsVisibility, pages, page, pageSize, manual, order, total, data } = this.props;
        const { selectedRows, columns } = this.state;
        const { component, properties } = this;
        
        const cols = [ ...columns ];

        for (let i = 0; i < cols.length; i++) {
            if (typeof cols[i].Header === 'string') {
                if (columnsVisibility[cols[i].Header] === false) {
                    cols[i].show = false;
                } else {
                    cols[i].show = true;
                }
            }
        }

        const tableConfig = {
            loading: this.state.loading,
            columns: cols,
            resizable: false,
            minRows: 5,

            ...properties,

            manual,
            multiSort: false,
            PaginationComponent: EMListPaginator,

            page,
            pageSize,

            sorted: order,
            
            onPageChange: (pageIndex) => this.handlePageChange(pageIndex), // Called when the page index is changed by the user
            onPageSizeChange: (pageSize, pageIndex) => this.handlePageSizeChange(pageSize, pageIndex),
            
            getTrProps: (state, row) => {
                return {
                    onClick: (e) => this.handleRowClick(e, row),
                    onDoubleClick: (e) => this.handleRowDoubleClick(e, row),
                    className: this.getRowClass(row)
                };
            },

            onSortedChange: (newSorted, column, shiftKey) => this.handleTableSortedChanged(newSorted, column, shiftKey),
            onFilteredChange: (filtered, column) => this.handleTableFilteredChange(filtered, column)
        };

        if (manual) {
            tableConfig.pages = pages;
            tableConfig.total = total;
        }

        return (
            <div className='content-container'>
                <div className="content-header">
                    <div className="grid clo-2 row-1">
                        <div className="cell">
                            <HeaderBackButton 
                                onClick={() => this.props.sendCancelMessage()}
                            />
                            <h1>{this.renderEntityName()}</h1>
                        </div>

                        <div className="cell align-right">
                            <Search />
                        </div>
                    </div>
                    
                </div>
                <div className='untill-base-table'>
                    <EMListHeader 
                        rows={selectedRows} 
                        component={component} 
                    />

                    <div className='untill-base-table-body'>
                        <Table
                            data={data}
                            {...tableConfig}
                        >
                            {(state, makeTable, instance) => {
                                this.tableState = state;
                                return makeTable();
                            }}
                        </Table>
                    </div>
                </div>
            </div>
        );
    }    
}

const mapStateToProps = (state) => {
    const { list, columnsVisibility } = state.plugin;
    const { data, showDeleted, pages, page, manual, pageSize, order, total } = list;

    return { 
        total,
        order: order || [],
        data: data || [],
        pages: pages || -1,
        page: page || 0,
        pageSize: pageSize || 20,
        manual: manual || false,
        showDeleted: !!showDeleted,
        columnsVisibility
    };
};

export default connect(mapStateToProps, { 
    sendNeedEditFormMessage,
    sendNeedFetchListDataMessage,
    setColumnsVisibility,
    sendCancelMessage,
    setListPage,
    setListPageSize,
    setListFilter,
    setListOrder,
    saveResolvedData
})(EMList);
