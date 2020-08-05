/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';

const StringCell = (props) => {
    const { value } = props;
    let val = '';

    if (value) {
        val = value.toString();
    }

    return <span className="table-cell string-value">{val}</span>;
} 

export default React.memo(StringCell);