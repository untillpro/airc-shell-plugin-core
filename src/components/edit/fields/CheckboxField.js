/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';

import { Checkbox } from '../../../base/components'

class CheckboxField extends Component {
    handleChange(event) {
        const { onChange } = this.props;
        const value = Number(event.target.checked);

        if (onChange && typeof onChange === 'function' ) {
            onChange(value);
        }
    }

    render() {
        const { field, value, disabled } = this.props;

        if (!field) return null;

        const { text } = field;

        return (
            <Checkbox
                disabled={disabled}
                onChange={(val) => this.handleChange(val)}
                checked={!!value}
            >
                {text}
            </Checkbox>
        );
    }
}

export default CheckboxField;