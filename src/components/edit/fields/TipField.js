/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import { Tip } from 'airc-shell-core';

const TipField = (props) => {
    const { field } = props;

    if (!field) return null;

    const {
        text,
        opened
    } = field;

    return <Tip text={text} opened={opened} />;
}

export default TipField;