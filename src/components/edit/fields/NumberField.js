/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { NumberInput } from 'airc-shell-core';

class NumberField extends Component {
    handleChange(value = null) {
        const { onChange, field } = this.props;
        const { accessor } = field;

        if (onChange && typeof onChange === 'function' ) {
            onChange({[accessor]: value});
        }
    }

    getComponentProps() {
        const { field } = this.props;
        const props = {};

        if (field) {
            const {
                min,
                max,
                step,
                decimalSeparator,
                precision,
                parser,
                formatter,
                autofocus
            } = field;

            if (decimalSeparator) props.decimalSeparator = decimalSeparator;
            if (precision && precision > 0) props.precision = Number(precision);
            if (autofocus) props.autofocus = true;
            if (typeof min === 'number' && (min >= 0 || min < 0)) props.min = Number(min);
            if (typeof max === 'number' && (max >= 0 || max < 0)) props.max = Number(max);
            if (step && step > 0) props.step = step;
            if (parser && typeof parser === 'function') props.parser = parser;
            if (formatter && typeof formatter === 'function') props.formatter = formatter;
        }

        return props;
    }

    getValue() {
        const { value } = this.props;

        let val = Number(value);

        if (isNaN(val)) {
            val = 0;
        }

        return val;
    }

    render() {
        const { field, disabled } = this.props;
        if (!field) return null;
        const { placeholder } = field;
        const props = this.getComponentProps();

        return (
            <NumberInput 
                {...props}
                disabled={disabled}
                value={this.getValue()}
                placeholder={placeholder}
                onChange={(event) => this.handleChange(event)}  
            />
        );
    }
}

export default NumberField;