/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Popconfirm } from 'antd';
import { Icon, translate as t } from 'airc-shell-core';
import * as Icons from 'airc-shell-core/const/Icons';

class TableAreaListRow extends PureComponent {
    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleEdit() {
        const { onEdit, index } = this.props;

        if (_.isFunction(onEdit)) {
            onEdit(index);
        }
    }

    handleDelete() {
        const { onDelete, index} = this.props;

        if (_.isFunction(onDelete)) {
            onDelete(index);
        }
    }

    renderIcon() {
        const { form } = this.props.data;

        return (
            <div className="form-ico">
                <Icon icon={form === 3 ? Icons.ICON_CIRCLE : Icons.ICON_SQUARE} />
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
                <div className="action" onClick={this.handleEdit}>
                    <Icon icon={Icons.ICON_EDIT} />
                </div>

                <Popconfirm
                    title={t("Are you sure to delete this table?","form")}
                    onConfirm={this.handleDelete}
                    okText={t("Yes", "common")}
                    cancelText={t("No", "common")}
                >
                    <div className="action">
                        <Icon icon={Icons.ICON_DELETE_SOLID} />
                    </div>
                </Popconfirm>
                
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