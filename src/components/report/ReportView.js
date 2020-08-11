import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import RListHeader from './RListHeader';

import { 
    HeaderBackButton, 
    ListPaginator,
    BooleanCell,
    LocationCell,
    NumberCell,
    PriceCell,
    StringCell,
    DateTimeCell
} from '../common/';
import { Table, Search } from '../../base/components';

import { 
    sendCancelMessage, 
    sendDoGenerateReport 
} from '../../actions';

import { 
    TYPE_REPORTS,
    C_REPORT_NAME,
    C_REPORT_TABLE_PROPS
} from '../../classes/contributions/Const';

class ReportView extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            columns: [],
            properties: {}
        };


        this.handleCancelClick = this.handleCancelClick.bind(this);
    }

    componentDidMount() {
        const properties = this.prepareProps(); 
        const columns = this.prepareColumns();

        this.setState({ columns, properties });

        this.props.sendDoGenerateReport();
    }

    componentDidUpdate() {
        console.log('ReportView updated: ', this.props);
    }

    prepareProps() {
        const { contributions, report } = this.props;
        const reportPoint = contributions.getPoint(TYPE_REPORTS, report);

        let tableProps = {};

        if (reportPoint) {
            let props = reportPoint.getContributuionValue(C_REPORT_TABLE_PROPS);

            if (props && _.isPlainObject(props)) {
                tableProps = props;
            }
        }

        // removing prohibited props

        delete tableProps.data;
        delete tableProps.pages;
        delete tableProps.loading;
        delete tableProps.columns;

        return tableProps;
    }

    prepareColumns() {
        const { contributions, report } = this.props;

        let columns = [];

        const entityListContributions = contributions.getPointContributions(TYPE_REPORTS, report);

        if (entityListContributions.columns) {
            _.each(entityListContributions.columns, (col) => {
                const column = this.prepareColumn(col);

                if (column) {
                    columns.push(column);
                }
            });
        }

        console.log('Result columns: ', columns);

        return columns;
    }

    prepareColumn(columnProps) {
        const { accessor, header, type, width } = columnProps;
    
        if (
            !accessor || 
            !header ||
            (typeof accessor !== 'string' && typeof accessor !== 'function') || 
            typeof header !== 'string') {
                return null;
        }
    
        const column = {
            "id": accessor,
            "Header": header
        };
    
        if (typeof accessor === 'function') {
            column.accessor = accessor;
        } else {
            switch (type) {
                case 'location': column.accessor = (d) => <LocationCell value={_.get(d, accessor)} />; break;
                case 'number': column.accessor = (d) => <NumberCell value={_.get(d, accessor)} />; break;
                case 'boolean': column.accessor = (d) => <BooleanCell value={_.get(d, accessor)} />; break;
                case 'price': column.accessor = (d) => <PriceCell value={_.get(d, accessor)} />; break;
                case 'time': column.accessor = (d) => <DateTimeCell value={_.get(d, accessor)} format="HH:mm" />; break;
                case 'date': column.accessor = (d) => <DateTimeCell value={_.get(d, accessor)} format="DD/MM/YYYY" />; break;
                default: column.accessor = (d) => <StringCell value={_.get(d, accessor)} />;
            }

        }

        if (width) {
            column.width = width;
        }

        return column;
    };

    handleCancelClick() {
        console.log('cancel clicked');
        this.props.sendCancelMessage()
    }

    renderEntityName() {
        const { report, contributions } = this.props;

        const name = contributions.getPointContributionValue(TYPE_REPORTS, report, C_REPORT_NAME);

        if (name) {
            return name;
        }

        return '<Noname>'; //todo default name.
    }

    render() { 
        const { data, loading } = this.props;
        const { columns, properties, searchStr } = this.state;
        
        const tableConfig = {
            data: data || [],
            loading,
            columns,
            resizable: false,
            minRows: 5,

            ...properties,

            PaginationComponent: ListPaginator,
        };

        return (
            <div className='content-container'>
                <div className="content-header">
                    <div className="grid clo-2 row-1">
                        <div className="cell">
                            <HeaderBackButton 
                                onClick={this.handleCancelClick}
                            />
                            <h1>{this.renderEntityName()}</h1>
                        </div>

                        <div className="cell align-right">
                            <Search defaultValue={searchStr}/>
                        </div>
                    </div>
                </div>

                <RListHeader />

                <div className='untill-base-table'>
                    <div className='untill-base-table-body'>
                        <Table
                            {...tableConfig}
                            //onTableDataUpdate={(resolvedData) => this.handleTableDataUpdate(resolvedData)}
                            //ref={ ref => this.table = ref}
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
    const { fetchingData: loading } = state.plugin;
    const { reportType: report, reportData: data } = state.reports;
    const { contributions } = state.context;

    return { 
        loading,
        report, 
        data,
        contributions 
    };
}

const mapDispatchToProps =  {
    sendCancelMessage,
    sendDoGenerateReport
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportView);