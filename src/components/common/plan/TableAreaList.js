import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Button, Empty } from 'airc-shell-core';

import TableAreaListRow from './TableAreaListRow';

import {
    PlusOutlined
} from '@ant-design/icons';

class TableAreaList extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            closed: this._isClosed()
        };

        this.handleListToggle = this.handleListToggle.bind(this);
    }

    _isClosed() {
        return !!localStorage.getItem('table_list_closed');
    }

    handleListToggle() {
        const { closed } = this.state;

        this.setState({ closed: !closed });
        localStorage.setItem('table_list_closed', !closed);
    }

    renderToggler() {
        const { toggleable } = this.props;
        const { closed } = this.state;

        if (!toggleable) return null;

        return (
            <div className="table-area-list-toggler" onClick={this.handleListToggle}>
                {closed ? 'Open' : 'Close'}
            </div>
        );
    }

    renderList() {
        const { tables, onEdit, onDelete } = this.props;

        if (!_.isArray(tables) || _.size(tables) === 0) {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
        }

        return _.map(tables, (tableData, index) =>
            <TableAreaListRow
                key={`table_${tableData.id || index}`}
                index={index}
                data={tableData}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );
    }

    renderAddButton() {
        const { onAdd } = this.props;

        return (
            <div className="table-area-list-button">
                <Button
                    onClick={onAdd}
                    icon={<PlusOutlined />}
                    type="primary"
                    block
                >
                    Add table
                </Button>
            </div>
        );

    }

    render() {
        const { toggleable } = this.props;
        const { closed } = this.state;

        return (
            <div className={cn("table-area-list", { "__is_hidden": closed && toggleable })}>
                {this.renderToggler()}

                <div className="table-area-list-container">
                    {this.renderList()}
                    {this.renderAddButton()}
                </div>
            </div>
        );
    }
}

TableAreaList.propTypes = {
    tables: PropTypes.arrayOf(PropTypes.object),
    onAdd: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default TableAreaList;