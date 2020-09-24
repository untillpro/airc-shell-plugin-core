import _ from 'lodash';
import React, { PureComponent } from "react";
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import blacklist from "blacklist";
import { Table } from '../../../base/components';

import ListTableRowAction from './ListTableRowAction';
import ListTableHeader from './ListTableHeader';
import ListColumnFilter from './ListColumnFilter';
import ListPaginator from './ListPaginator';

import BooleanCell from './cell_types/BooleanCell';
import LocationCell from './cell_types/LocationCell';
import NumberCell from './cell_types/NumberCell';
import PriceCell from './cell_types/PriceCell';
import StringCell from './cell_types/StringCell';
import DateTimeCell from './cell_types/DateTimeCell';


import log from "../../../classes/Log";

const DefaultVisibleColumns = { "ID": false, "id": false, "Id": false };

class ListTable extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            columns: [],
            allColumns: [],
            selectedRows: [],
            selectedFlatRows: {},
            showPositionColum: true,
            showDeleted: false,
            columnsVisibility: DefaultVisibleColumns,
            properties: {},
            component: {
                'showActionsColumn': true,
                'allowMultyselect': false,
                'allowSelection': true,
                'showColumnsToggler': true,
                'showDeletedToggler': true,
                'showPositionColum': true,
                'showHeaderButtons': true,
                'showHeaderFilter': true
            }
        };

        this.handlePageChange = this.handlePageChange.bind(this);
        this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
        this.handleRowClick = this.handleRowClick.bind(this);
        this.handleRowDoubleClick = this.handleRowDoubleClick.bind(this);
        this.handleTableSortedChanged = this.handleTableSortedChanged.bind(this);
        this.handleTableFilteredChange = this.handleTableFilteredChange.bind(this);

        this.handleVisibleChange = this.handleVisibleChange.bind(this);
        this.handleShowDeletedChange = this.handleShowDeletedChange.bind(this);

        this.getTrPropsCallback = this.getTrPropsCallback.bind(this);

        this.doFilter = this.doFilter.bind(this);
    }

    componentDidMount() {
        const component = this.prepareComponent();
        const properties = this.prepareProps();
        const columns = this.getColumns();

        this.setState({
            properties,
            columns,
            component
        });
    }

    handleVisibleChange(value, columnId) {
        const { columnsVisibility } = this.state;

        let res = {};

        if (columnsVisibility && typeof columnsVisibility === "object") {
            res = { ...columnsVisibility };
        }

        if (columnId) {
            res[columnId] = !!value;
        }

        this.setState({ columnsVisibility: res });
    }

    handleShowDeletedChange(value) {
        const { onShowDeletedChanged } = this.props;

        let val = !!value;

        this.setState({ showDeleted: !!val });

        if (onShowDeletedChanged && typeof onShowDeletedChanged === 'function') {
            onShowDeletedChanged(val);
        }
    }

    handleRowClick(event, row) {
        const { onRowClick, onSelectedChange } = this.props;

        const { selectedRows, selectedFlatRows, component } = this.state;
        const { allowMultyselect, allowSelection } = component;

        const { index, original } = row;
        let selectedRowsNew, selectedFlatRowsNew;

        event.preventDefault();
        event.stopPropagation();

        if (allowSelection) {
            if (allowMultyselect) {
                selectedFlatRowsNew = { ...selectedFlatRows };

                if (selectedRows.indexOf(index) >= 0) {
                    selectedRowsNew = _.without(selectedRows, index);
                    selectedFlatRowsNew = delete (selectedFlatRowsNew[index]);
                } else {
                    selectedRowsNew = [...selectedRows, index];
                    selectedFlatRowsNew[index] = original;
                }
            } else {
                selectedRowsNew = [index];
                selectedFlatRowsNew = { [index]: original };
            }
        }

        if (_.isFunction(onRowClick)) {
            onRowClick(event, row);
        }

        if (_.isFunction(onSelectedChange)) {
            onSelectedChange(selectedFlatRowsNew);
        }

        this.setState({
            selectedRows: selectedRowsNew,
            selectedFlatRows: selectedFlatRowsNew
        });
    }

    handleRowDoubleClick(event, row) {
        const { onDoubleClick } = this.props;

        if (onDoubleClick && typeof onDoubleClick === "function") {
            event.stopPropagation();

            onDoubleClick(event, row);
        }
    }

    handleRowsSelectorChange() {
        const { selectedRows } = this.state;
        const { data, allowMultyselect } = this.props;

        if (data && allowMultyselect && (!selectedRows || selectedRows.length <= 0)) {
            const rows = data.map(row => row.index);

            this.setState({ selectedRows: rows, selectedFlatRows: data });
        } else if (selectedRows && selectedRows.length > 0) {
            this.setState({
                selectedRows: [],
                selectedFlatRows: {}
            });
        }
    }

    handlePageChange(page) {
        const { onPageChange } = this.props;

        if (onPageChange && typeof onPageChange === "function") {
            onPageChange(page)
        }
    }

    handlePageSizeChange(pageSize, page) {
        const { onPageSizeChange } = this.props;

        if (onPageSizeChange && typeof onPageSizeChange === "function") {
            onPageSizeChange(pageSize, page)
        }
    }

    handleTableSortedChanged(newOrder) {
        const { onSortedChange } = this.props;

        if (onSortedChange && typeof onSortedChange === "function") {
            onSortedChange(newOrder)
        }
    }

    handleTableFilteredChange(filtered, column) {
        const { onFilterChage } = this.props;

        if (onFilterChage && typeof onFilterChage === "function") {
            //onFilterChage(filtered, column)
        }
    }

    doFilter(filter, row, column) {
        const { type, filterType, accessor } = column;
        const { value } = filter;

        const rowValue = accessor(row);

        console.log("doFilter in action: ", value, rowValue);

        const checkType = type || filterType;

        switch(checkType) {
            default: return _.(rowValue, value);
        }
        
    }

    getDynamicColumns(props, data) {
        //TODO!!! - тут вообще хз. 

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

    prepareColumn(columnProps) {
        const { accessor, header, Header, type, width, id, filterable } = columnProps;

        if (
            !accessor ||
            (!header && !Header) ||
            (typeof accessor !== 'string' && typeof accessor !== 'function')
        ) {
            return null;
        }

        console.log("column props: ", columnProps);

        const column = {
            "id": typeof accessor === "string" ? accessor : id,
            "Header": header || Header,
            "accessor": accessor,
            "filterable": !!filterable,
            "filterMethod": this.doFilter,
            "Filter": (info) => <ListColumnFilter {...info} />
        };

        switch (type) {
            case 'location': column.Cell = (d) => <LocationCell value={d.value} />; break;
            case 'number': column.Cell = (d) => <NumberCell value={d.value} />; break;
            case 'boolean': column.Cell = (d) => <BooleanCell value={d.value} />; break;
            case 'price': column.Cell = (d) => <PriceCell value={d.value} />; break;
            case 'time': column.Cell = (d) => <DateTimeCell value={d.value} format="HH:mm" />; break;
            case 'date': column.Cell = (d) => <DateTimeCell value={d.value} format="DD/MM/YYYY" />; break;
            default: column.Cell = (d) => <StringCell value={d.value} />;
        }

        if (width) {
            column.width = width;
        }

        return column;
    };

    getColumns() {
        const { contributions, entity } = this.props;
        const { component } = this.state;
        const { showPositionColum, showActionsColumn } = component;

        let columns = [];

        if (showPositionColum) {
            columns.push({
                'Header': () => this.renderRowsSelector(),
                'width': 40,
                'Cell': (props) => this.renderPosition(props),
                'sortable': false,
                'filterable': false,
                'toggleable': false,
                'id': 'row-selector'
            });
        }

        const entityListContributions = contributions.getPointContributions('list', entity);

        if (entityListContributions && entityListContributions.columns) {
            _.each(entityListContributions.columns, (column) => {
                if (_.isPlainObject(column)) {
                    const c = this.prepareColumn(column);

                    if (c) {
                        columns.push(c)
                    }
                }
            });
        }

        if (showActionsColumn) {
            columns.push({
                'id': "actions",
                'Header': 'Actions',
                'width': 100,
                'Cell': this.renderActions.bind(this),
                'sortable': false,
                'filterable': false,
                'toggleable': false,
            });
        }

        return columns;
    }

    getVisibleColumns() {
        const { columns, columnsVisibility } = this.state;
        const res = [];


        console.log("getVisibleColumns: ", columns, columnsVisibility);

        if (columns && _.size(columns) > 0) {
            if (_.isPlainObject(columnsVisibility) && _.size(columnsVisibility) > 0) {
                columns.forEach((column) => {
                    const c = { ...column };

                    if (c.id in columnsVisibility) {
                        c.show = !!columnsVisibility[c.id];
                    }

                    res.push(c);
                });
            } else {
                return columns;
            }
        }

        console.log("getVisibleColumns res: ", res);

        return res;
    }

    getRowClass(row) {
        //TODO - изменить на использование индекса

        const { selectedRows, component } = this.state;
        const { allowSelection } = component;

        let resultClasses = "";

        if (allowSelection !== false) {
            resultClasses += ' -selectable';
        }

        if (row) {
            const { index } = row;

            if (selectedRows.indexOf(index) >= 0) {
                resultClasses += ' -selected';
            }
        }

        return resultClasses;
    }

    prepareComponent() {
        const { component } = this.state;
        const { contributions, entity } = this.props;

        let componentProps = contributions.getPointContributionValue('list', entity, 'component');

        if (!componentProps || !_.isPlainObject(componentProps)) {
            return {}
        }

        return { ...component, ...componentProps };
    }

    prepareProps() {
        const { contributions, entity } = this.props;

        let tableProps = contributions.getPointContributionValue('list', entity, 'table');

        if (!tableProps || !_.isPlainObject(tableProps)) {
            return {}
        }

        return blacklist(tableProps, "data", "pages", "loading", "columns");
    }

    renderRowsSelector() {
        const { selectedRows, component } = this.state;
        const { allowSelection } = component;

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
        // TODO: переделать под индекс
        const { selectedRows } = this.state;
        const { index } = row;

        if (index >= 0) {
            if (selectedRows.indexOf(index) >= 0) {
                return (
                    <input
                        className={'small'}
                        key={`row_${index}`}
                        type='checkbox'
                        onChange={(e) => this.handleRowClick(e, row)}
                        checked
                    />
                );
            }
        }

        return index + 1;
    }

    renderActions(row) {
        const { entity, rowActions } = this.props;

        return rowActions.map((action) => {
            if (_.isPlainObject(action)) {
                return (
                    <ListTableRowAction
                        key={`action_${action.type}`}
                        type={action.type}
                        entity={entity}
                        action={action.action}
                        data={row.original}
                    />
                );
            }

            return null;
        });
    }

    getTrPropsCallback(state, row) {
        return {
            onClick: (e) => this.handleRowClick(e, row),
            onDoubleClick: (e) => this.handleRowDoubleClick(e, row),
            className: this.getRowClass(row)
        };
    }

    prepareData(data) {
        const { search, searchBy } = this.props;

        // continue here
        
        if (search && typeof search === "string" && _.isArray(searchBy) && searchBy.length > 0) {
            return this.doSearch(data, search, searchBy);
        }

        return data;
    }

    render() {
        log('%c Render Table List', 'color: green; font-size: 120%');

        const { data, pages, page, pageSize, manual, order, total, headerActions } = this.props;
        const { selectedRows, selectedFlatRows, properties, component, loading, showDeleted } = this.state;


        const tableConfig = {
            loading,
            minRows: 5,
            ...properties,
            manual,
            page,
            pageSize,
            sorted: order,
        };

        if (manual) {
            tableConfig.pages = pages;
            tableConfig.total = total;
        }

        return (
            <div className='untill-base-table'>
                <Table
                    resizable={false}
                    data={this.prepareData(data)}
                    columns={this.getVisibleColumns()}

                    PaginationComponent={ListPaginator}

                    {...tableConfig}

                    showPaginationTop={true}
                    showPaginationBottom={true}

                    onPageChange={this.handlePageChange}
                    onPageSizeChange={this.handlePageSizeChange}
                    onSortedChange={this.handleTableSortedChanged}
                    onFilteredChange={this.handleTableFilteredChange}

                    getTrProps={this.getTrPropsCallback}

                    filterable={!!component.showHeaderFilter}
                    //defaultFiltered={[{"id": "name", "value": "Co"}, {"id": "hq_id", "value": "Co"}]}
                >
                    {(state, makeTable) => {
                        const { allDecoratedColumns } = state;

                        return (
                            <>
                                <ListTableHeader
                                    showDeleted={showDeleted}
                                    columns={allDecoratedColumns}
                                    rows={selectedRows}
                                    flatRows={selectedFlatRows}
                                    component={component}
                                    buttons={headerActions}
                                    onVisibleChange={this.handleVisibleChange}
                                    onDeletedChange={this.handleShowDeletedChange}
                                />

                                <div className='untill-base-table-body'>
                                    {makeTable()}
                                </div>
                            </>
                        );
                    }}
                </Table>
            </div>
        );
    }
}

ListTable.propTypes = {
    contributions: PropTypes.object.isRequired,
    entity: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    pages: PropTypes.number,
    page: PropTypes.number,
    pageSize: PropTypes.number,
    manual: PropTypes.bool,
    order: PropTypes.array,
    total: PropTypes.number,
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onRowClick: PropTypes.func,
    onSelectedChange: PropTypes.func,
    onSortedChange: PropTypes.func,
    onFilterChage: PropTypes.func,
    rowActions: PropTypes.arrayOf(PropTypes.object),
    headerActions: PropTypes.arrayOf(PropTypes.object),
};

const mapStateToProps = (state) => {
    const { contributions } = state.context;

    return {
        contributions
    };
};


export default connect(mapStateToProps, {})(ListTable);