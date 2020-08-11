/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';

const NumberCell = (props) => {
    const { value, type, decs } = props;
    let formatedValue;

    switch (type) {
        case 'float':
        case 'double': 
            formatedValue = Number(value).toFixed(decs || 2).toString();
            break;
        default: 
            formatedValue = Number(value).toFixed(0).toString();
    }       

    return <span className="table-cell number-value">{formatedValue}</span>; 
}

export default React.memo(NumberCell)