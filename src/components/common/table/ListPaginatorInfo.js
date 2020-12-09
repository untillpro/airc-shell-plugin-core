/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { translate as t } from 'airc-shell-core';
import PropTypes from 'prop-types';

class ListPaginatorInfo extends Component {
    render() {
        const { page: p, pageSize: s, total: t } = this.props;

        if (t <= 0) {
            return null;
        }
        
        const from = p * s + 1;
        const to  = (p + 1) * s;
        
        return (
            <div>
                {t("{{from}} - {{to}} out of {{total}} items", "list", {from, to: to < t ? to : t, total: t})} 
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
