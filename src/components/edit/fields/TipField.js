/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';

import { Tip } from '../../../base/components'

export default (props) => {
    const { field } = props;

    if (!field) return null;

    const {
        text,
        opened
    } = field;

    return <Tip text={text} opened={opened} />;
}
