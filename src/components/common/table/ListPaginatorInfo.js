/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ListPaginatorInfo extends Component {
    render() {
        const { page: p, pageSize: s, total: t } = this.props;

        const from = p * s + 1;
        const to  = (p + 1) * s;
        
        return (
            <div>
                {from} - {to < t ? to : t} out of {t} items
            </div>
        );
    }
}

ListPaginatorInfo.propTypes = {
    page: PropTypes.number,
    pageSize: PropTypes.number,
    total: PropTypes.number
};

export default ListPaginatorInfo;
