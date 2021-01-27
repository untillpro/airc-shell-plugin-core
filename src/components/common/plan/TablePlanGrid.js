import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Empty, translate as t } from 'airc-shell-core';
import TablePlanCard from './TablePlanCard';

import EmptyImage from '../../../assets/images/empty/no-free-tables.png';

class TablePlanGrid extends PureComponent {
    render() {
        const { data, onEdit, onDelete, onHide, onAdd } = this.props;

        if (_.isEmpty(data)) {
            return (
                <Empty
                    className="empty-block-gray"
                    image={EmptyImage}
                    imageStyle={{
                        height: 60,
                    }}
                    description={t("No tables available")}
                >
                    <Button onClick={onAdd} type="primary">Add new table</Button>
                </Empty>
            );
        }

        const ops = { onEdit, onDelete, onHide };

        return (
            <div className="table-plan-grid">
                {_.map(data, (d) => <TablePlanCard data={d} {...ops} />)}
            </div>
        );
    }
}

TablePlanGrid.propTypes = {
    data: PropTypes.object,
    onAdd: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
};

export default TablePlanGrid;