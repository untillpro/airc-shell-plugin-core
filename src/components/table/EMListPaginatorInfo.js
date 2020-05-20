/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class EMListPaginatorInfo extends Component {
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

EMListPaginatorInfo.propTypes = {
    page: PropTypes.number,
    pageSize: PropTypes.number,
    total: PropTypes.number
};

export default EMListPaginatorInfo;
