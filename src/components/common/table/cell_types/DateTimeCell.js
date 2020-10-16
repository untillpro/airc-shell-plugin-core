/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import React, { PureComponent } from 'react';
import { DatePicker } from 'airc-shell-core';

import moment from 'moment';

const defaultFormat = "LLLL";

class DateTimeCell extends PureComponent {
    constructor() {
        super();

        this.state = {
            value: null,
            saving: false
        };

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        const { value } = this.props;

        this.setState({
            value,
            key: this.key()
        });
    }

    componentDidUpdate(oldProps) {
        if (this.props.value !== oldProps.value) {
            this.setState({ value: this.props.value})
        }
    }

    handleChange(value) {
        const { onSave, onError, cell, prop } = this.props;
        const { _entry } = cell.original;
        const { saving } = this.state;

        if (saving) return;

        if (_.isFunction(onSave) && _.isObject(_entry)) {
            if (value !== this.state.value) {
                this.setState({ saving: true });

                onSave(value, prop, _entry)
                    .then(() => {
                        this.setState({ value: value, saving: false });
                    })
                    .catch((e) => {
                        if (_.isFunction(onError)) {
                            onError(e)
                        }
                    });
            }
        }
    }

    isEditable() {
        return this.props.editable === true
    }

    key() {
        const { nestingPath } = this.props.cell;
        const { value } = this.state;

        if (nestingPath && _.isArray(nestingPath)) {
            return `datetime.value.${nestingPath.join(".")}.${value}`;
        } else {
            return `datetime.value.${value}`;
        }
    }

    format() {
        const { format } = this.props;

        return _.isString(format) ? format : defaultFormat;
    }

    type() {
        switch(this.props.type) {
            case "time": return "time";
            default: return "date";
        }
    }

    renderEditable() {
        const { value, key } = this.state;

        return (
            <div key={key} className="table-cell datetime-value">
                <DatePicker 
                    type={this.type()}
                    format={this.format()}
                    //value={this.getValue()}
                    //defaultValue={moment(new Date().valueOf(), this.getFormat())}
                    defaultValue={value > 0 ? moment(value) : null}
                    onChange={this.handleChange} 
                />
            </div>
        );
    }

    renderReadOnly() {
        const { value, key } = this.state;
        let formatedValue = '';

        if (value) {
            formatedValue = moment(value).format(this.format());
        }

        return <div key={key} className="table-cell string-value">{formatedValue}</div>;;
    }


    render() {
        return this.isEditable() ? this.renderEditable() : this.renderReadOnly()
    }
}

export default DateTimeCell;