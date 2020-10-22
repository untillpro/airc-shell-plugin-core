import _ from 'lodash';
import React, { PureComponent } from "react";
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import blacklist from "blacklist";
import { Checkbox, Logger } from 'airc-shell-core';
import isEqual from 'react-fast-compare';

import {
    KEY_RETURN,
    KEY_UP,
    KEY_DOWN
} from 'keycode-js';

import Table from 'react-table';

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

const DefaultVisibleColumns = { "ID": false, "id": false, "Id": false };

const getDynamicValue = (cell, key, props) => {
    let val = null;
    const { accessor, value_accessor, classifier_link, defaultValue } = props;

    /*
    if (!_.isNil(defaultValue)) {
        val = defaultValue;
    }
    */
    // TODO: ПОменять названия переменных. Сейчас как-то топорно. Заполнить README

    if (cell[accessor]) {
        _.forEach(cell[accessor], (row) => {
            if (_.get(row, classifier_link) === key) {
                val = row[value_accessor];
            }
        });
    }

    return val;
};

const getCellRenderer = (d, opts) => {
    const { type, prop, editable, onValueSave, onError } = opts;

    switch (type) {
        case 'location':
            return <LocationCell value={d.value} />;

        case 'number':
            return <NumberCell cell={d} value={d.value} editable={editable} prop={prop} onSave={onValueSave} onError={onError} />;

        case 'float':
            return <NumberCell cell={d} value={d.value} editable={editable} prop={prop} onSave={onValueSave} onError={onError} type="float" />;

        case 'boolean':
            return <BooleanCell cell={d} value={d.value} editable={editable} prop={prop} onSave={onValueSave} onError={onError} />;

        case 'price':
            return <PriceCell cell={d} value={d.value} editable={editable} prop={prop} onSave={onValueSave} onError={onError} />;

        case 'time':
            return <DateTimeCell cell={d} value={d.value} editable={editable} prop={prop} format="HH:mm" onSave={onValueSave} onError={onError} />;

        case 'date':
            return <DateTimeCell type="time" cell={d} value={d.value} editable={editable} prop={prop} format="DD/MM/YYYY" onSave={onValueSave} onError={onError} />;

        case 'datetime':
            return <DateTimeCell cell={d} value={d.value} editable={editable} prop={prop} format="DD/MM/YYYY HH:mm" onSave={onValueSave} onError={onError} />;

        default:
            return <StringCell cell={d} value={d.value} editable={editable} prop={prop} onSave={onValueSave} onError={onError} />;
    }
}

class ListTable extends PureComponent {
    constructor(props) {
        super(props);

        this.pageRows = null;

        this.state = {
            loading: false,
            expanded: [],
            columns: [],
            allColumns: [],
            selectedRows: [],
            selectedFlatRows: {},
            showPositionColumn: true,
            showDeleted: false,
            columnsVisibility: DefaultVisibleColumns,
            properties: {
                'showPagination': true,
                'showPaginationBottom': true,
                'showPaginationTop': true,
                'showPageSizeOptions': true,
            },
            component: {
                'showActionsColumn': false,
                'allowMultyselect': false,
                'allowSelection': true,
                'showColumnsToggler': true,
                'showDeletedToggler': true,
                'showPositionColumn': true,
                'showHeaderButtons': true,
                'showColumnFilter': false,
                'allowSearch': true,
                'searchBy': 'name'
            }
        };

        this.handleKeyPress = this.handleKeyPress.bind(this);
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

        this.changeSelected = this.changeSelected.bind(this);
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

        document.addEventListener("keydown", this.handleKeyPress);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress)
    }

    componentDidUpdate(oldProps) {
        const { selectedRows, selectedFlatRows } = this.props;

        if (!isEqual(selectedRows, oldProps.selectedRows) || !isEqual(selectedFlatRows, oldProps.selectedFlatRows)) {
            this.setState({
                selectedRows: selectedRows || [],
                selectedFlatRows: selectedFlatRows || {},
            })
        }
    }

    changeSelected(offset) {
        const { selectedRows } = this.state;
        const { onSelectedChange } = this.props;

        const selectedRowsNew = [];
        const selectedFlatRowsNew = {};

        let lastIndex = 0;
        let nextIndex = 0;

        let rowsLength = _.size(this.pageRows);
        if (rowsLength > 0) {
            if (_.size(selectedRows) > 0) {
                const lastRowId = _.last(selectedRows);
                const arr = lastRowId.split('.');
                lastIndex = Number(arr[0]);

                nextIndex = lastIndex + offset;

                if (nextIndex < 0) {
                    nextIndex = 0;
                }

                if (nextIndex >= rowsLength) {
                    nextIndex = rowsLength - 1;
                }
            }

            const row = this.pageRows[nextIndex];
            const rowId = nextIndex.toString();

            selectedRowsNew.push(rowId);
            selectedFlatRowsNew[rowId] = row._original;
        }

        this.setState({
            selectedRows: selectedRowsNew,
            selectedFlatRows: selectedFlatRowsNew
        });

        if (_.isFunction(onSelectedChange)) {
            onSelectedChange(selectedRowsNew, selectedFlatRowsNew);
        }
    }

    handleKeyPress(event) {
        const { selectedRows, selectedFlatRows } = this.state;
        const { onEnterPress } = this.props;
        const { keyCode } = event;

        if (keyCode === KEY_RETURN && _.isFunction(onEnterPress)) {
            onEnterPress(selectedRows, selectedFlatRows);
        }

        if (keyCode === KEY_UP) {
            this.changeSelected(-1)
        }

        if (keyCode === KEY_DOWN) {
            this.changeSelected(1)
        }
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

        event.preventDefault();
        event.stopPropagation();

        if (allowSelection) {
            let selectedRowsNew;
            let selectedFlatRowsNew;

            //const rowIndex = nestingPath.join('.');
            const rowIndex = index;

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
                if (selectedRows.indexOf(rowIndex) >= 0) {
                    selectedRowsNew = [];
                    selectedFlatRowsNew = {};
                } else {
                    selectedRowsNew = [rowIndex];
                    selectedFlatRowsNew = { [rowIndex]: original };
                }
            }

            if (_.isFunction(onSelectedChange)) {
                onSelectedChange(selectedRowsNew, selectedFlatRowsNew);
            }

            this.setState({
                selectedRows: selectedRowsNew,
                selectedFlatRows: selectedFlatRowsNew
            });
        }

        if (_.isFunction(onRowClick)) {
            onRowClick(event, row);
        }
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
        this.setState({ expanded: newExpanded });
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

    prepareDynamicColumns(columnProps) {
        const { classifiers, onValueSave, onError } = this.props;

        if (!classifiers || !_.isPlainObject(classifiers) || _.size(classifiers) === 0) {
            return [];
        }

        const {
            classificator,
            text_accessor,
            value_accessor,
            classifier_link,
            accessor,
            type,
            editable,
            defaultValue
        } = columnProps;

        if (!classificator || !_.isString(classificator)) {
            throw new Error("Dynamic fields should provide \"classificator\" property");
        }

        if (!text_accessor || !_.isString(text_accessor)) {
            throw new Error("Dynamic fields should provide \"text_accessor\" property");
        }

        if (!value_accessor || !_.isString(value_accessor)) {
            throw new Error("Dynamic fields should provide \"value_accessor\" property");
        }

        if (!classifier_link || !_.isString(classifier_link)) {
            throw new Error("Dynamic fields should provide \"classifier_link\" property");
        }

        const columns = {};
        const props = { accessor, value_accessor, classifier_link, defaultValue };

        _.forEach(classifiers, (lc) => { // lc - location classifier

            if (lc && lc[classificator]) {
                _.forEach(lc[classificator], (c) => {
                    const key = c[text_accessor];

                    if (!columns[key]) {
                        columns[key] = {
                            "id": key,
                            "Header": key,
                            "accessor": (d) => getDynamicValue(d, key, props),
                            "type": type || null,
                            "linked": [],
                            "Cell": (d) => getCellRenderer(d, { prop: value_accessor, type, editable, onValueSave, onError })
                        };
                    }

                    columns[key]["linked"].push(c.id);
                });
            }
        });

        return _.map(columns, (o) => o);
    }

    prepareColumn(columnProps, component) {
        const { onValueSave, onError } = this.props;

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
            editable,
            propName
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

                return column.Cell({ value: renderTotalCell(column, data) });
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

        column.Cell = (d) => getCellRenderer(d, { type, prop: propName || id || accessor, editable, onValueSave, onError });

        if (width) {
            column.width = width;
        }

        return column;
    };

    getColumns(component) {
        const { contributions, entity } = this.props;
        const { showPositionColumn, showActionsColumn } = component;

        let columns = [];

        // position column
        if (showPositionColumn) {
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
                toggleable: false,
                Expander: ({ isExpanded, subRows, ...rest }) => {
                    if (!subRows || subRows.length === 0) {
                        return null;
                    }

                    return (
                        <div style={{ zIndex: 100, position: 'relative' }} className="centered">
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

                    if (column.dynamic === true) {
                        const c = this.prepareDynamicColumns(column, component);

                        if (c && c.length > 0) {
                            columns = _.concat(columns, c);
                        }
                    } else {
                        const c = this.prepareColumn(column, component);

                        if (c) {
                            columns.push(c)
                        }
                    }

                }
            });
        }

        //action column
        if (showActionsColumn) {
            columns.push({
                'id': "actions",
                'Header': 'Actions',
                'width': 150,
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
        const { selectedRows, component } = this.state;
        const { allowSelection } = component;


        let resultClasses = "";

        if (allowSelection !== false) {
            resultClasses += ' -selectable';
        } else {
            return '';
        }

        if (row) {
            //const { nestingPath } = row;
            const rowIndex = row.index;

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
                <div className="centered">
                    <Checkbox
                        onChange={(event) => this.handleRowsSelectorChange(event)}
                        checked={selectedRows.length > 0}
                    />
                </div>
            );
        }

        return null;
    }

    renderPosition(row) {
        const { selectedRows } = this.state;
        const { index } = row;

        //const { nestingPath } = row;
        //const rowIndex = nestingPath.join('.');
        const rowIndex = index;

        if (selectedRows.indexOf(rowIndex) >= 0) {
            return (
                <div className="centered">
                    <Checkbox
                        key={`row_${rowIndex}`}
                        onChange={(e) => this.handleRowClick(e, row)}
                        checked
                    />
                </div>
            );
        }


        return <div className="centered">{index + 1}</div>;
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
                        data={row}
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
        Logger.l('%c Render Table List', 'color: green; font-size: 120%');

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
                    keyField="id"
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
                        const { allDecoratedColumns, pageRows } = state;

                        this.pageRows = pageRows;

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
    classifiers: PropTypes.object,
    pages: PropTypes.number,
    page: PropTypes.number,
    pageSize: PropTypes.number,
    manual: PropTypes.bool,
    order: PropTypes.array,
    total: PropTypes.number,
    selectedRows: PropTypes.array,
    selectedFlatRows: PropTypes.object,
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    onEnterPress: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onRowClick: PropTypes.func,
    onSelectedChange: PropTypes.func,
    onSortedChange: PropTypes.func,
    onFilterChage: PropTypes.func,
    onValueSave: PropTypes.func,
    onError: PropTypes.func,
    rowActions: PropTypes.arrayOf(PropTypes.object),
    headerActions: PropTypes.arrayOf(PropTypes.object),
};

const mapStateToProps = (state) => {
    const { contributions, api } = state.context;

    return {
        contributions,
        api
    };
};


export default connect(mapStateToProps, {})(ListTable);