/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import moment from 'moment';
import { DatePicker } from '../../../base/components'

class DateField extends Component {

    handleChange(date, dateString) {
        const { onChange, field } = this.props;
        let outFormat = 'YYYY-MM-DD';

        if (field && field.outFormat) {
            outFormat = String(field.outFormat);
        }

        if (onChange && typeof onChange === 'function' ) {
            onChange(date ? date.format(outFormat) : null);
        }
    }

    getComponentProps() {
        return {};
    }

    getFormat() {
        const { field } = this.props;

        let format = 'YYYY-MM-DD';

        if (field && field.format) format = field.format;

        return format;
    }

    getValue() {
        const { value } = this.props;
        const format = this.getFormat();

        if (!value) return null;

        return moment(value, format);
    }
    
    render() {
        const {  disabled, field } = this.props;

        if (!field) return null;

        const props = this.getComponentProps();

        return (
            <DatePicker 
                {...props}
                disabled={disabled}
                value={this.getValue()}
                //defaultValue={moment(new Date().valueOf(), this.getFormat())}
                defaultValue={null}
                onChange={this.handleChange.bind(this)} 
            />
        );
    }
}

export default DateField;


