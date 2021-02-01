import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { translate as t } from 'airc-shell-core';

class TableAreaListRow extends PureComponent {
    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleEdit() {

    }

    handleDelete() {

    }

    renderIcon() {
        const { form } = this.props.data;

        return (
            <div className="form-ico">
                ico
            </div>
        );
    }

    renderLabel() {
        const { number } = this.props.data;

        return <div className="label">{t("Table #{{number}}", "form", { number })}</div>
    }

    renderActions() {
        return (
            <div className="actions">
                <div className="action" onClick={this.handleEdit}>E</div>
                <div className="action" onClick={this.handleDelete}>D</div>
            </div>
        );
    }

    render() {
        return (
            <div className="table-area-list-row" onClick={this.handleClick}>
                {this.renderIcon()}
                {this.renderLabel()}
                {this.renderActions()}
            </div>
        );
    }
};

TableAreaListRow.propTypes = {
    index: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default TableAreaListRow;