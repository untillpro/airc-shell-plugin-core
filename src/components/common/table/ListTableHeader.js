/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate as t } from 'airc-shell-core';
import { Toggler, Button } from 'airc-shell-core';

import {
    PlusOutlined,
    DeleteOutlined,
    ReloadOutlined,
    CopyOutlined
} from '@ant-design/icons';

import ListColumnsToggler from './ListColumnsToggler';


class ListTableHeader extends Component {
    constructor(props) {
        super(props);

        this.handleShowDeletedChange = this.handleShowDeletedChange.bind(this);
        this.handleColumnsVisibleChange = this.handleColumnsVisibleChange.bind(this);
    }

    handleShowDeletedChange(value) {
        const { onDeletedChange } = this.props;

        if (onDeletedChange && typeof onDeletedChange === "function") {
            onDeletedChange(value);
        }
    }

    handleColumnsVisibleChange(value, columnId) {
        const { onVisibleChange } = this.props;

        if (onVisibleChange && typeof onVisibleChange === "function") {
            onVisibleChange(value, columnId);
        }
    }

    _getIcon(icon) {
        if (icon && typeof icon === "string") {
            switch (icon) {
                case "plus": return <PlusOutlined />;
                case "delete": return <DeleteOutlined />;
                case "reload": return <ReloadOutlined />;
                case "copy": return <CopyOutlined />;
                default: return null;
            }
        }

        return null;
    }

    renderHeaderButtons() {
        const { component: { showHeaderButtons } } = this.props;
        const { rows, buttons } = this.props;

        if (!showHeaderButtons || !buttons || !buttons.length) return null;

        const result = [];

        buttons.forEach((btn) => {
            const { buttonType, icon, type, key, text, disabled, onClick, title } = btn;

            switch (buttonType) {
                case "icon":
                    result.push(
                        <Button
                            title={title}
                            icon={this._getIcon(icon || 'none')}
                            key={key}
                            disabled={typeof disabled === "function" ? disabled(rows) : disabled}
                            onClick={() => onClick(rows)}
                        />
                    );
                    break;
                default:
                    result.push(
                        <Button
                            title={title}
                            type={type || 'primary'}
                            key={key}
                            text={text}
                            disabled={typeof disabled === "function" ? disabled(rows) : disabled}
                            onClick={() => onClick(rows)}
                        > {text} </Button>
                    );
            }

        });

        return (
            <div className='untill-base-table-header-actions'>
                {result}
            </div>
        );
    }

    renderHeaderTogglers() {
        const {
            columns,
            component: { showDeletedToggler, showColumnsToggler },
            showDeleted
        } = this.props;

        return (
            <div className='untill-base-table-header-togglers'>
                {
                    showDeletedToggler ? (
                        <Toggler
                            label={t("Show deleted", "list")}
                            right
                            onChange={this.handleShowDeletedChange}
                            checked={showDeleted}
                        />
                    ) : null
                }
                {
                    showColumnsToggler ? (
                        <ListColumnsToggler
                            columns={columns}
                            label={t("Hide columns", "list")}
                            onChange={this.handleColumnsVisibleChange}
                        />
                    ) : null
                }
            </div>
        );
    }

    render() {
        return (
            <div className='untill-base-table-header header-actions'>
                {this.renderHeaderTogglers()}
                {this.renderHeaderButtons()}
            </div>
        );
    }
}

ListTableHeader.propTypes = {
    component: PropTypes.object,
    rows: PropTypes.array,
    flatRows: PropTypes.object,
    showDeleted: PropTypes.bool,
    toggleDeletedRowsView: PropTypes.func,
    sendNeedEditFormMessage: PropTypes.func,
    sendNeedRemoveMessage: PropTypes.func,
    sendNeedRefreshListDataMessage: PropTypes.func
};

export default ListTableHeader;
