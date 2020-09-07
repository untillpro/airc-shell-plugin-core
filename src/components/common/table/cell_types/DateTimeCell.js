/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import moment from 'moment';

const defaultFormat = "LLLL";

const DateTimeCell = (props) => {
    const { value, format } = props;
    let formatedValue = '';

    if (value) {
        formatedValue = moment(value).format(format || defaultFormat);
    }

    return <span className="table-cell datetime-value">{formatedValue}</span>; 
}

export default React.memo(DateTimeCell)