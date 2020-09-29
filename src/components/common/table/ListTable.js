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

import { 
    filterString, 
    filterGroup,
    renderTotalCell 
} from './helpers';

import log from "../../../classes/Log";

const DefaultVisibleColumns = { "ID": false, "id": false, "Id": false };

class ListTable extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            expanded: [],
            columns: [],
            allColumns: [],
            selectedRows: [],
            selectedFlatRows: {},
            showPositionColum: true,
            showDeleted: false,
            columnsVisibility: DefaultVisibleColumns,
            properties: {
                'showPagination': true,
                'showPaginationBottom': true,
                'showPaginationTop': true,
                'showPageSizeOptions': true,
            },
            component: {
                'showActionsColumn': true,
                'allowMultyselect': false,
                'allowSelection': true,
                'showColumnsToggler': true,
                'showDeletedToggler': true,
                'showPositionColum': true,
                'showHeaderButtons': true,
                'showColumnFilter': false,
                'allowSearch': true,
                'searchBy': 'name'
            }
        };

        this.handlePageChange = this.handlePageChange.bind(this);
        this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
        this.handleRowClick = this.handleRowClick.bind(this);
        this.handleRowDoubleClick = this.handleRowDoubleClick.bind(this);
        this.handleTableSortedChanged = this.handleTableSortedChanged.bind(this);
        this.handleTableFilteredChange = this.handleTableFilteredChange.bind(this);
        this.handleExpandedChange = this.handleExpandedChange.bind(this);

        this.handleVisibleChange = this.handleVisibleChange.bind(this);
        this.handleShowDeletedChange = this.handleShowDeletedChange.bind(this);

        this.getTrPropsCallback = this.getTrPropsCallback.bind(this);

        this.doFilter = this.doFilter.bind(this);
    }

    componentDidMount() {
        const component = this.prepareComponent();
        const properties = this.prepareProps();
        const columns = this.getColumns(component);

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

        const { nestingPath, original } = row;
        let selectedRowsNew, selectedFlatRowsNew;

        const rowIndex = nestingPath.join('.');

        event.preventDefault();
        event.stopPropagation();

        if (allowSelection) {
            if (allowMultyselect) {
                selectedFlatRowsNew = { ...selectedFlatRows };

                if (selectedRows.indexOf(rowIndex) >= 0) {
                    selectedRowsNew = _.without(selectedRows, rowIndex);
                    selectedFlatRowsNew = delete (selectedFlatRowsNew[rowIndex]);
                } else {
                    selectedRowsNew = [...selectedRows, rowIndex];
                    selectedFlatRowsNew[rowIndex] = original;
                }
            } else {
                selectedRowsNew = [rowIndex];
                selectedFlatRowsNew = { [rowIndex]: original };
            }
        }

        if (_.isFunction(onRowClick)) {
            onRowClick(event, row);
        }

        if (_.isFunction(onSelectedChange)) {
            onSelectedChange(selectedRowsNew, selectedFlatRowsNew);
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
            onFilterChage(filtered, column)
        }
    }

    handleExpandedChange(newExpanded) {
        this.setState({expanded: newExpanded});
    }

    doFilter(filter, row, column) {
        const { type, filterType, accessor } = column;
        const { value } = filter;

        const rowValue = accessor(row);

        const checkType = type || filterType;

        let res = true;

        switch (checkType) {
            case "location": res = filterGroup(rowValue, value); break;
            default: res = filterString(rowValue, value); break;
        }

        return res;
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

    prepareColumn(columnProps, component) {
        const {
            accessor,
            header,
            Header,
            type,
            width,
            id,
            totalType,
            Footer,
            filterable,
            toggleable,
            filterType,
            editable
        } = columnProps;

        const showTotal = component.showTotal || this.props.showTotal;

        if (
            !accessor ||
            (!header && !Header) ||
            (typeof accessor !== 'string' && typeof accessor !== 'function')
        ) {
            return null;
        }

        const column = {
            "id": typeof accessor === "string" ? accessor : id,
            "Header": header || Header,
            "accessor": accessor,
            "filterMethod": this.doFilter,
            "type": type || null,
            "Filter": (info) => <ListColumnFilter {...info} />
        };

        if (filterable !== false && filterType && typeof filterType === "string") {
            column.filterType = filterType;
        }

        if (totalType && typeof totalType === "string") {
            column.totalType = totalType;
        }

        if (Footer) {
            column.Footer = Footer;
        } else if (showTotal === true) {
            column.Footer = (info) => {
                const { column, data } = info;

                return column.Cell({ value: renderTotalCell(column, data)})
            }
        }

        if (_.isBoolean(toggleable)) {
            column.toggleable = toggleable;
        }

        if (_.isBoolean(filterable)) {
            column.filterable = filterable;
        }

        if (_.isBoolean(editable)) {
            column.editable = editable;
        }

        switch (type) {
            case 'location': column.Cell = (d) => <LocationCell value={d.value} />; break;
            case 'number': column.Cell = (d) => <NumberCell cell={d} value={d.value} editable={editable} />; break;
            case 'boolean': column.Cell = (d) => <BooleanCell cell={d} value={d.value} editable={editable} />; break;
            case 'price': column.Cell = (d) => <PriceCell cell={d} value={d.value} editable={editable} />; break;
            case 'time': column.Cell = (d) => <DateTimeCell cell={d} value={d.value} editable={editable} format="HH:mm" />; break;
            case 'date': column.Cell = (d) => <DateTimeCell cell={d} value={d.value} editable={editable} format="DD/MM/YYYY" />; break;
            default: column.Cell = (d) => <StringCell cell={d} value={d.value} editable={editable} />;
        }

        if (width) {
            column.width = width;
        }

        return column;
    };

    getColumns(component) {
        const { contributions, entity } = this.props;
        const { showPositionColum, showActionsColumn } = component;

        let columns = [];

        // position column
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

        // custom expander
        if (true) {
            columns.push({
                expander: true,
                Header: null,
                width: 20,
                Expander: ({ isExpanded, subRows, ...rest }) => {
                    if (!subRows || subRows.length === 0) {
                        return null;
                    }

                    return (
                        <div style={{ zIndex: 100, position: 'relative' }}>
                            {isExpanded
                                ? <span>-</span>
                                : <span>+</span>}
                        </div>
                    );
                },
                style: {
                    cursor: "pointer",
                    fontSize: 25,
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                }
            });
        }

        const entityListContributions = contributions.getPointContributions('list', entity);

        if (entityListContributions && entityListContributions.columns) {
            _.each(entityListContributions.columns, (column) => {
                if (_.isPlainObject(column)) {
                    const c = this.prepareColumn(column, component);

                    if (c) {
                        columns.push(c)
                    }
                }
            });
        }

        //action column
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
            const { nestingPath } = row;
            const rowIndex = nestingPath.join('.');

            if (selectedRows.indexOf(rowIndex) >= 0) {
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
        const { properties } = this.state;
        const { contributions, entity } = this.props;

        let tableProps = contributions.getPointContributionValue('list', entity, 'table');

        if (!tableProps || !_.isPlainObject(tableProps)) {
            return {}
        }

        const props = { ...properties, ...tableProps };

        return blacklist(props, "data", "pages", "loading", "columns");
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
        if (!row) return {};

        const { subRows } = row;

        if (subRows && subRows.length > 0) {
            return {}
        };

        return {
            onClick: (e) => this.handleRowClick(e, row),
            onDoubleClick: (e) => this.handleRowDoubleClick(e, row),
            className: this.getRowClass(row),
        };
    }

    searchFilter(value) {
        const { component: { searchBy, allowSearch } } = this.state;

        if (allowSearch && value && searchBy && typeof searchBy === 'string') {
            return [{ id: searchBy, value }];
        }

        return [];
    }

    render() {
        log('%c Render Table List', 'color: green; font-size: 120%');

        const { data, pages, page, pageSize, manual, order, filter, total, headerActions, search, loading } = this.props;
        const { selectedRows, selectedFlatRows, properties, component, showDeleted, expanded } = this.state;


        const tableConfig = {
            loading,
            minRows: 5,
            ...properties,
            manual,
            page,
            pageSize,
            sorted: order,
            filtered: filter,
            expanded: expanded,
            subRowsKey: "variants"
        };

        if (manual) {
            tableConfig.pages = pages;
            tableConfig.total = total;
        }

        const cols = this.getVisibleColumns();

        return (
            <div className='untill-base-table'>
                <Table
                    resizable={false}
                    data={data}
                    columns={cols}

                    PaginationComponent={ListPaginator}

                    {...tableConfig}
                    
                    showPagination={component.showPagination}
                    showPaginationTop={component.showPaginationTop}
                    showPaginationBottom={component.showPaginationBottom}

                    onPageChange={this.handlePageChange}
                    onPageSizeChange={this.handlePageSizeChange}
                    onSortedChange={this.handleTableSortedChanged}
                    onFilteredChange={this.handleTableFilteredChange}
                    onExpandedChange={this.handleExpandedChange}

                    getTrProps={this.getTrPropsCallback}
                    defaultFiltered={this.searchFilter(search)}
                    filterable={component.showColumnFilter}
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
    const { locations } = state.options;
    const { contributions } = state.context;

    return {
        locations,
        contributions
    };
};


export default connect(mapStateToProps, {})(ListTable);