import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { IconButton, NoImage, translate as t} from 'airc-shell-core';

import {
    ICON_EDIT,
    ICON_VISIBLE,
    ICON_INVISIBLE,
    ICON_TRASH
} from '../../../const/Icons';

class TablePlanCard extends PureComponent {
    constructor(props) {
        super(props);

        this.handleEditAction = this.handleEditAction.bind(this);
        this.handleHideAction = this.handleHideAction.bind(this);
        this.handleDeleteAction = this.handleDeleteAction.bind(this);
    }

    handleEditAction() {
        const { onEdit } = this.props;
        const { _entry } = this.props?.data;

        if (_.isFunction(onEdit) && _.isPlainObject(_entry)) {
            onEdit(_entry);
        } else {
            throw new Error('onEdit handler not implemented');
        }
    }

    handleHideAction() {
        const { onHide } = this.props;
        const { _entry } = this.props?.data;

        if (_.isFunction(onHide) && _.isPlainObject(_entry)) {
            onHide(_entry);
        } else {
            throw new Error('onHide handler not implemented');
        }
    }

    handleDeleteAction() {
        const { onDelete } = this.props;
        const { _entry } = this.props?.data;

        if (_.isFunction(onDelete) && _.isPlainObject(_entry)) {
            onDelete(_entry);
        } else {
            throw new Error('onDelete handler not implemented');
        }
    }

    renderInfo() { 
        const { name, table, hide } = this.props.data;
        const tablesCount = table ? _.size(table) : 0;

        return (
            <div className="info">
                <div className="tables">
                    {tablesCount} tables
                </div>

                <div className="title">
                    {name}
                </div>

                <div className="buttons">
                    <IconButton 
                        icon={hide === 1 ? ICON_INVISIBLE : ICON_VISIBLE} 
                        size="small" 
                        ghost 
                    />

                    <IconButton 
                        icon={ICON_EDIT} 
                        size="small" 
                        ghost 
                    />

                    <div className="grow" />

                    <IconButton 
                        icon={ICON_TRASH} 
                        size="small" 
                        ghost 
                    />
                </div>
            </div>
        );
    }

    renderImage() {
        const { image } = this.props?.data;

        if (_.isString(image) && !_.isEmpty(image)) {
            const styles = { backgroundImage: `url(${image})`};

            return (
                <div className="image" style={styles}/>
            );
        }

        return <div className="image">
            <NoImage />
        </div>;
    }

    render() {
        if (!_.isPlainObject(this.props.data) || _.isEmpty(this.props.data)) {
            console.error('No data was passed to TablePlanCard component')
        }

        console.log("TablePlanCard.render(): ", this.props.data);

        const { hide } = this.props.data;

        return (
            <div key="table_plan_1" className={cn("table-plan-card", {"hide": hide === 1})}>
                {this.renderImage()}
                {this.renderInfo()}
            </div>
        );
    }
}

TablePlanCard.propTypes = {
    data: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
};

export default TablePlanCard;