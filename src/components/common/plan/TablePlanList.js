import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Empty, translate as t } from 'airc-shell-core';
import TablePlanRow from './TablePlanRow';

class TablePlanList extends PureComponent {
    render() {
        const { data, onEdit, onDelete, onHide, onAdd } = this.props;

        if (_.isEmpty(data)) {
            return (
                <Empty description={t("No tables available")} >
                    <Button onClick={onAdd} type="primary">{t("Add new table", "list")}</Button>
                </Empty>
            );
        }

        const ops = { onEdit, onDelete, onHide };

        return (
            <div className="table-plan-list">
                {_.map(data, (d) => <TablePlanRow data={d} {...ops} />)}
            </div>
        );
    }
}

TablePlanList.propTypes = {
    data: PropTypes.object,
    onAdd: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
};


export default TablePlanList;