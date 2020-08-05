/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';

import { NumberInput } from '../../../base/components'

class NumberField extends Component {
    handleChange(value = null) {
        const { onChange } = this.props;

        if (onChange && typeof onChange === 'function' ) {
            onChange(value);
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

    render() {
        const { value, field, disabled } = this.props;

        if (!field) return null;

        const { placeholder } = field;

        const props = this.getComponentProps();

        console.log(`Number field ${field.accessor} value: ${value}`);

        return (
            <NumberInput 
                {...props}
                disabled={disabled}
                value={Number(value)}
                placeholder={placeholder}
                onChange={(event) => this.handleChange(event)}  
            />
        );
    }
}

export default NumberField;