/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import { Checkbox } from 'antd';

export const BooleanCell = (props) => {
    const { value } = props;

    if (!!value) {
        return <Checkbox defaultChecked disabled />
    } 

    return <Checkbox defaultChecked={false} disabled />
}

export default React.memo(BooleanCell)