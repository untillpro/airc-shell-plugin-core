import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Header from './TablePlanHeader';
import List from './TablePlanList';
import Grid from './TablePlanGrid';

const VIEW_TYPE_GRID = 'grid';
const VIEW_TYPE_LIST = 'list';

class TablePlan extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            type: this._getViewType()
        };

        this.handleAddAction = this.handleAddAction.bind(this);
        this.handleViewTypeChange = this.handleViewTypeChange.bind(this);
        this.handleEditAction = this.handleEditAction.bind(this);
        this.handleHideAction = this.handleHideAction.bind(this);
        this.handleDeleteAction = this.handleDeleteAction.bind(this);
    }

    _getViewType() {
        const { location } = this.props;
        let key = `table_view_type_${location}`;
        let type = localStorage.getItem(key);
        
        return type === VIEW_TYPE_LIST ? type : VIEW_TYPE_GRID
    }

    handleAddAction() {
        const { onAdd } = this.props;

        if (_.isFunction(onAdd)) {
            onAdd();
        }
    }

    handleViewTypeChange() {
        const { location } = this.props;
        const { type } = this.state;
        const newType = type === VIEW_TYPE_GRID ? VIEW_TYPE_LIST : VIEW_TYPE_GRID;
        const key = `table_view_type_${location}`;

        localStorage.setItem(key, newType);

        this.setState({
            type: newType
        })
    }

    handleEditAction(entity) {
        const { onEdit } = this.props;

        if (_.isFunction(onEdit)) {
            onEdit(entity);
        }
    }

    handleHideAction(entity) {
        const { onHide } = this.props;

        if (_.isFunction(onHide)) {
            onHide(entity);
        }
    }

    handleDeleteAction(entity) {
        const { onDelete } = this.props;

        if (_.isFunction(onDelete)) {
            onDelete(entity);
        }
    }

    render() {
        const { type } = this.state;
        const { name, data } = this.props;

        const props = {
            data,
            onEdit: this.handleEditAction,
            onAdd: this.handleAddAction,
            onDelete: this.handleDeleteAction,
            onHide: this.handleHideAction
        };

        return (
            <div className="table-plan">
                <div className="table-plan-container">
                    <Header 
                        name={name} 
                        view={type}
                        onViewChange={this.handleViewTypeChange}
                        onAdd={this.handleAddAction}
                    />
                    {type === VIEW_TYPE_LIST ? <List {...props} /> : <Grid {...props} />}
                </div>
            </div>
        );
    }
}

TablePlan.propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.object,
    onAdd: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
};

export default TablePlan;