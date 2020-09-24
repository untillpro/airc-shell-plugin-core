/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import moment from 'moment';
import { DatePicker } from '../../../base/components';

import log from '../../../classes/Log';

const DEFAULT_DATE_FORMAT = "DD/MM/YYYY";

class DateField extends Component {

    handleChange(date, dateString) {
        log("DateField changed: ", date, dateString, date.valueOf());

        const { onChange } = this.props;

        if (onChange && typeof onChange === 'function' ) {
            onChange(date ? date.valueOf() : null);
        }
    }

    getComponentProps() {
        return {};
    }

    getFormat() {
        const { field } = this.props;

        let format = DEFAULT_DATE_FORMAT;

        if (field && field.format && typeof field.format === 'string') {
            format = field.format;
        }

        return format;
    }

    getValue() {
        const { value } = this.props;
        if (!value) return moment();

        log('Date-time field value: ', value);

        return moment(value);
    }
    
    render() {
        const {  disabled, field } = this.props;

        if (!field) return null;

        const props = this.getComponentProps();

        return (
            <DatePicker 
                {...props}
                disabled={disabled}
                format={this.getFormat()}
                //value={this.getValue()}
                //defaultValue={moment(new Date().valueOf(), this.getFormat())}
                defaultValue={this.getValue()}
                onChange={this.handleChange.bind(this)} 
            />
        );
    }
}

export default DateField;


