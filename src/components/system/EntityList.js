/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Search } from '../../base/components';

import { ListTable } from '../common/';

import { HeaderBackButton } from '../common/';

import {
    setColumnsVisibility,
    sendCancelMessage,
    sendNeedFetchListDataMessage,

    setListPage,
    setListPageSize,
    setListFilter,
    setListOrder,
    setListShowDeleted,

    sendNeedEditFormMessage,
    sendNeedCopyFormMessage,
    sendNeedUnifyFormMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
    sendNeedRefreshListDataMessage
} from '../../actions/';

class EMList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            selected: [],
            search: "",
            searchBy: [ "name", "hq_id" ]
        };

        this.handlePageChange = this.handlePageChange.bind(this);
        this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
        this.handleRowDoubleClick = this.handleRowDoubleClick.bind(this);
        this.handleRowClick = this.handleRowClick.bind(this);
        this.handleSelectedRowsChange = this.handleSelectedRowsChange.bind(this);
        this.handleTableSortedChanged = this.handleTableSortedChanged.bind(this);
        this.handleTableFilteredChange = this.handleTableFilteredChange.bind(this);
        this.handleShowDeletedChanged = this.handleShowDeletedChanged.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
    }

    componentDidMount() {
        const rowActions = this.prepareRowActions();
        const headerActions = this.prepareHeaderActions();

        this.setState({
            rowActions,
            headerActions
        });
    }

    prepareRowActions() {
        const { contributions, entity } = this.props;

        if (!contributions) return [];

        const res = [];
        const actions = contributions.getPointContributionValues('list', entity, 'actions')

        if (actions && _.isArray(actions) && actions.length > 0) {
            _.forEach(actions, (type) => {
                res.push({
                    type,
                    action: (data) => this.handleAction(data, type)
                })
            });
        }
        console.log("prepareRowActions result: ", res);

        return res;
    }

    prepareHeaderActions() {
        const { contributions, entity } = this.props;

        if (!contributions) return [];

        const res = [];
        const component = contributions.getPointContributionValue('list', entity, 'component');

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
        if (!actionType || typeof actionType != "string") return null;

        switch (actionType) {
            case 'add':
                return {
                    buttonType: "icon",
                    icon: 'plus',
                    key: 'header-action-add',
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'remove':
                return {
                    buttonType: "icon",
                    icon: 'delete',
                    key: 'header-action-remove',
                    disabled: (rows) => !rows.length,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'refresh':
                return {
                    buttonType: "icon",
                    icon: 'reload',
                    key: 'header-action-refresh',
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'edit':
                return {
                    buttonType: "simple",
                    type: 'primary',
                    key: 'header-action-edit',
                    text: 'Edit item',
                    disabled: (rows) => rows.length !== 1,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'massedit':
                return {
                    buttonType: "simple",
                    type: 'primary',
                    key: 'header-action-massedit',
                    text: 'Mass edit',
                    hidden: (rows) => (!rows || rows.length <= 0),
                    disabled: (rows) => rows.length <= 1,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            default: return null;
        }
    }

    handleShowDeletedChanged(value) {
        this.props.setListShowDeleted(!!value);
    }

    handleHeaderAction(action) {
        const { selected } = this.state;

        switch (action) {
            case 'add':
                this.props.sendNeedEditFormMessage(null);
                break;
            case 'edit':
                this.props.sendNeedEditFormMessage(selected);
                break;
            case 'refresh':
                this.props.sendNeedRefreshListDataMessage();
                break;
            case 'massedit':
                this.props.sendNeedMassEditFormMessage(selected);
                break;
            case 'remove':
                if (selected && selected.length > 0) {
                    this.props.sendNeedRemoveMessage(selected);
                }

                break;
            default: break;
        }
    }

    handleAction(row, type) {
        console.log("handle row action", row, type);

        switch (type) {
            case 'edit':
                this.props.sendNeedEditFormMessage([row.id]);
                break;

            case 'copy':
                this.props.sendNeedCopyFormMessage([row.id]);
                break;

            case 'unify':
                this.props.sendNeedUnifyFormMessage([row.id]);
                break;

            case 'remove':
                if (row.state === 1) {
                    this.props.sendNeedRemoveMessage(row.id);
                } else {
                    this.props.sendNeedReduceMessage(row.id);
                }

                break;

            default: break;
        }

        return false;
    }

    handleRowClick(event, row) {
        return null;
    }

    handleRowDoubleClick(event, row) {
        event.stopPropagation();

        let id = null;
        const { original } = row;

        if (original && original.id) id = original.id;

        if (id && id > 0) this.props.sendNeedEditFormMessage([id]);
    }

    handleSelectedRowsChange(rows, flatRows) {
        const selected = [];

        if (rows.length > 0) {
            _.forEach(flatRows, (row) => selected.push(row.id));
        }
        
        this.setState({selected});
    }

    handlePageChange(page) {
        //TODO CHECK
        const { manual } = this.props;

        this.props.setListPage(page);

        if (manual) this.setState({ loading: true });
    }

    handlePageSizeChange(pageSize, page) {
        //TODO CHECK
        const { manual } = this.props;

        this.props.setListPageSize(pageSize);

        if (manual) this.setState({ loading: true });
    }

    handleTableSortedChanged(newOrder) {
        //TODO CHECK
        const { manual } = this.props;

        this.props.setListOrder(newOrder);

        if (manual) this.setState({ loading: true });
    }

    handleTableFilteredChange(newFilter) {
        //TODO FOR MANUAL MODE
        return null;
    }

    handleSearchChange(value) {
        this.setState({ search: value || ""});
    }

    renderHeader() {
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
        const { entity, data, pages, page, pageSize, manual, order, total } = this.props;
        const { rowActions, headerActions, search, searchBy } = this.state;

        return (
            <div className='content-container'>
                <div className="content-header">
                    <div className="grid clo-2 row-1">
                        <div className="cell">
                            <HeaderBackButton
                                onClick={() => this.props.sendCancelMessage()}
                            />
                            <h1>{this.renderHeader()}</h1>
                        </div>

                        <div className="cell align-right">
                            <Search 
                                onChange={this.handleSearchChange}
                            />
                        </div>
                    </div>
                </div>

                <ListTable
                    entity={entity}
                    data={data}
                    pages={pages}
                    page={page}
                    pageSize={pageSize}
                    manual={manual}
                    order={order}
                    total={total}
                    onPageChange={this.handlePageChange}
                    onPageSizeChange={this.handlePageSizeChange}
                    onDoubleClick={this.handleRowDoubleClick}
                    onRowClick={this.handleRowClick}
                    onSelectedChange={this.handleSelectedRowsChange} //TODO
                    onSortedChange={this.handleTableSortedChanged}
                    onFilterChage={this.handleTableFilteredChange}
                    onShowDeletedChanged={this.handleShowDeletedChanged}
                    rowActions={rowActions}
                    headerActions={headerActions}
                    search={search}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const { list, columnsVisibility } = state.plugin;
    const { data, showDeleted, pages, page, manual, pageSize, order, total } = list;

    return {
        contributions,
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
    setListShowDeleted,
    sendNeedCopyFormMessage,
    sendNeedUnifyFormMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
    sendNeedRefreshListDataMessage
})(EMList);
