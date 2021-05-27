/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import moment from 'moment';
import { TimePicker } from 'airc-shell-core'

import log from '../../../classes/Log';

const DEFAULT_TIME_FORMAT = "HH:mm:ss";

class TimeField extends Component {
    handleChange(date, dateString) {
        const { onChange, field } = this.props;
        const { accessor } = field;

        if (onChange && typeof onChange === 'function' ) {
            let val = date ? date.valueOf() : null;
            onChange({[accessor]: val});
        }
    }

    getComponentProps() {
        return {};
    }

    getFormat() {
        const { field } = this.props;

        let format = DEFAULT_TIME_FORMAT;

        if (field && field.format && typeof field.format === 'string') {
            format = field.format;
        }

        return format;
    }

    getValue() {
        const { value } = this.props;
        if (!value) return moment();

        log('Time field value: ', value);

        return moment(value);
    }
    
    render() {
        const {  disabled, field } = this.props;

        if (!field) return null;

        const props = this.getComponentProps();

        return (
            <TimePicker 
                {...props}
                disabled={disabled}
                format={this.getFormat()}
                defaultValue={this.getValue()}
                onChange={this.handleChange.bind(this)} 
            />
        );
    }
}

export default TimeField;


