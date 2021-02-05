/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { Radio } from 'airc-shell-core';

import { funcOrString } from '../../../classes/helpers';

class RadioField extends Component {
    handleChange(event) {
        const { onChange, field } = this.props;
        const { accessor } = field;

        const value = event.target.value;

        if (onChange && typeof onChange === 'function' ) {
            onChange({[accessor]: value});
        }
    }

    getComponentProps() {
        const { field } = this.props;
        const props = {};

        if (field) {
            const {
                size,
                buttonStyle
            } = field;

            if (size) props.size = ['small', 'default', 'large'].indexOf(size) >= 0 ? size : 'default';
            if (buttonStyle) props.buttonStyle = (buttonStyle === 'solid') ? 'solid' : 'outline';
        }

        return props;
    }

    render() {
        const { field, value, disabled } = this.props;

        if (!field) return null;

        const {
            text,
            value: val
        } = field;

        return (
            <Radio 
                disabled={disabled}
                value={val}
                checked={String(value) === String(val)}
                onChange={this.handleChange.bind(this)}
            >
                {funcOrString(text)}
            </Radio>
        );
    }
}

export default RadioField;