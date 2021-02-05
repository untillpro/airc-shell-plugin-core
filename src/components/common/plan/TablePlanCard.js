import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Icon, IconButton, NoImage, getBlobPath} from 'airc-shell-core';
import * as Icons from 'airc-shell-core/const/Icons';

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
                        icon={<Icon icon={hide === 1 ? Icons.ICON_EYE_SOLID : Icons.ICON_HIDE} />} 
                        size="small" 
                        ghost 
                    />

                    <IconButton 
                        icon={<Icon icon={Icons.ICON_EDIT} />} 
                        size="small" 
                        ghost 
                    />

                    <div className="grow" />

                    <IconButton 
                        icon={<Icon icon={Icons.ICON_DELETE_SOLID} />} 
                        size="small" 
                        ghost 
                    />
                </div>
            </div>
        );
    }

    renderImage() {
        const { image } = this.props?.data;

        if (_.isNumber(image)) {
            const url = getBlobPath(image);
            const styles = { backgroundImage: `url(${url})`};

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
            <div className={cn("table-plan-card", {"hide": hide === 1})}>
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
    onDelete: PropTypes.func.isRequired,
};

export default TablePlanCard;