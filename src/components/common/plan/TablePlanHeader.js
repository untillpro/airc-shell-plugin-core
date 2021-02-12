import _ from 'lodash';
import React, { PureComponent } from 'react';
import { translate as t, Toggler, Button } from 'airc-shell-core';

import {
    PlusOutlined,
    AppstoreOutlined,
    MenuOutlined
  } from '@ant-design/icons';

class TablePlanHeader extends PureComponent {
    constructor(props) {
        super(props);

        this.handleShowDeletedChange = this.handleShowDeletedChange.bind(this);
    }

    handleShowDeletedChange(value) {
        const { onDeletedChange } = this.props;

        if (onDeletedChange && typeof onDeletedChange === "function") {
            onDeletedChange(value);
        }
    }

    renderButtons() {
        const { onViewChange, onAdd, view, location } = this.props;
        const buttons = [];

        if (_.isFunction(onAdd)) {
            buttons.push(<Button key={`add_header_btn_${location}`} type="primary" icon={<PlusOutlined />} onClick={onAdd} />);
        }

        if (_.isFunction(onViewChange)) {
            buttons.push(<Button key={`style_header_btn_${location}`} icon={view === 'grid' ? <AppstoreOutlined /> : <MenuOutlined />} onClick={onViewChange} />);
        }

        return buttons;
    }

    render() {
        const { name, showDeleted } = this.props;
        
        return (
            <div className="table-plan-header">
                <div className="title">{name}</div>

                <Toggler
                    label={t("Show deleted", "list")}
                    left
                    onChange={this.handleShowDeletedChange}
                    checked={showDeleted}
                />

                <div className="grow" />
                <div className="buttons">
                    {this.renderButtons()}
                </div>
            </div>
        );
    }
}

export default TablePlanHeader;