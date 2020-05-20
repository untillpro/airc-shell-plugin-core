/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';

import { Radio } from 'base/components'

class RadioField extends Component {
    handleChange(event) {
        const { onChange } = this.props;
        const value = event.target.value;

        if (onChange && typeof onChange === 'function' ) {
            onChange(value);
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

        console.log("Radio: ", field, value);
        
        return (
            <Radio 
                disabled={disabled}
                value={val}
                checked={String(value) === String(val)}
                onChange={this.handleChange.bind(this)}
            >
                {text}
            </Radio>
        );
    }
}

export default RadioField;