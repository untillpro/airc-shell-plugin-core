import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table } from 'antd';

import HeaderBackButton from '../common/HeaderBackButton';

import EMListHeader from './EMListHeader';
import EMListPaginator from './EMListPaginator';
import EMListRowAction from './EMListRowAction';

import EMListRowCellActions from './EMListRowCellActions';

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
} from '../../actions/';

class EMListAntd extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            columns: [],
            selectedRows: [],
        };

        this.actions = [];
        this.component = {};
        this.properties = {};
        this.selectionCfg = {};
    }

    componentDidMount() {
        this.prepareProps(); 
        this.getColumns();
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

        const selectionCfg = this.getSelectionCfg();

        // removing prohibited props

        delete tableProps.data;
        delete tableProps.pages;
        delete tableProps.loading;
        delete tableProps.columns;


        this.actions = actions;
        this.component = componentProps;
        this.properties = tableProps;
        this.selectionCfg = selectionCfg;
    }

    getSelectionCfg() {
        // TODO;

        const { contributions, entity } = this.props;

        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
            onSelect: (record, selected, selectedRows) => {
              console.log(record, selected, selectedRows);
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
              console.log(selected, selectedRows, changeRows);
            },
          };

        return rowSelection;
    }

    getDynamicColumns() {
        //TODO
        return [];
    }

    getActionsColumn() {    
        const { actions } = this.state;

        if (!actions || !_.isArray(actions) || actions.length === 0) {
            return null;
        }

        return {
            title: 'Actions',
            key: "row_actions",
            render: (t, r, i) => <EMListRowCellActions actions={actions} record={r} /> 
        }
    }

    /**
     * Не забыть про селектор строк
     */

    getColumns(props) {
        const { contributions, entity } = this.props;

        let columns = [];

        const entityListContributions = contributions.getPointContributions('list', entity);

        if (entityListContributions.columns) {
            _.each(entityListContributions.columns, (column) => {
                if (column.dynamic) {
                    columns = [...columns, ...this.getDynamicColumns(column)];  // TODO
                } else {
                    columns.push({
                        title: column.Header,
                        dataIndex: column.accessor,
                        key: column.accessor,
                    });
                }
            });
        }

        const actionsColumn = this.getActionsColumn();

        if (actionsColumn) {
            columns.push(actionsColumn)
        }
        
        /*
        if (columns.length > 0) {
            const visibility = {};

            columns.forEach((column) => {
                if (column.title && typeof column.title === 'string') {
                    visibility[column.title] = !(columnsVisibility[column.title] === false);
                }
            });

            this.props.setColumnsVisibility(visibility);
        }

        this.setState({ columns });
        */

        return columns;
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
        const { data } = this.props;
        const { columns, selectionCfg, selectedRows, component } = this.state;

        console.log('Table data: ', data);
        console.log('columns: ', columns);

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
                    </div>
                    
                </div>

                <div className='untill-base-table'>
                    <EMListHeader 
                        rows={selectedRows} 
                        component={component} 
                    />

                    <div className='untill-base-table-body'>
                        <Table 
                            columns={columns} 
                            rowSelection={selectionCfg} 
                            dataSource={data} 
                        />
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { list, columnsVisibility } = state.plugin;
    const { data, classifiers, showDeleted, pages, page, manual, pageSize, order, total } = list;

    return { 
        total,
        classifiers: classifiers || {},
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
})(EMListAntd);
