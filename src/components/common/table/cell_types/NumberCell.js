/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import React, { PureComponent } from 'react';
import { InputNumber } from 'airc-shell-core';
import {withStackEvents } from 'stack-events';

import { 
    KEY_RETURN, 
    KEY_ESCAPE 
} from 'keycode-js';

class NumberCell extends PureComponent {
    constructor() {
        super();

        this.state = {
            value: null,
            currentValue: null,
            formatter: null
        };

        this.ref = null;

        this.handleChange = this.handleChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
    }

    componentDidMount() {
        const { value } = this.props;

        this.setState({
            value,
            currentValue: value,
            key: this.key(),
            formatter: this.formatter()
        });
    }

    componentDidUpdate(oldProps) {
        if (this.props.value !== oldProps.value) {
            this.setState({ value: this.props.value, currentValue: this.props.value })
        }
    }

    formatter() {
        switch (this.props.type) {
            case 'float':
            case 'double': return (value) => Number(value).toFixed(4).toString();
            default: return (value) => Number(value).toFixed(0).toString();
        }
    }

    key() {
        const { index } = this.props.cell;
        const { value } = this.state;

        if (index && index >= 0) {
            return `number.value.${index}.${value}`;
        } else {
            return `number.value.${value}`;
        }
    }

    handleKeyDown(event) {
        switch (event.keyCode) {
            case KEY_RETURN: this.ref.blur(); break;
            case KEY_ESCAPE: this.ref.blur(); break;
            default: break;
        }
    }

    handleFocus() {
        this.props.pushEvents({
            "keydown": this.handleKeyDown
        });
    }

    handleBlur() {
        this.props.popEvents();
    }

    handleChange(value) {
        this.setState({ currentValue: value });
    }

    saveChanges(currentValue) {
        const { onSave, onError, cell, prop } = this.props;
        const { _entry } = cell.original;
        const { value, saving } = this.state;

        if (saving) return;

        if (_.isFunction(onSave) && _.isObject(_entry)) {
            if (value !== currentValue) {
                this.setState({ saving: true, currentValue });

                onSave(currentValue, prop, _entry, cell)
                    .then(() => {
                        this.setState({ value: currentValue, saving: false });
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

    renderEditable() {
        const { value, currentValue, formatter, key } = this.state;

        return (
            <div key={key} className="table-cell number-value">
                <InputNumber
                    ref={ref => this.ref = ref}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    onClick={(event) => event.stopPropagation()}
                    defaultValue={value}
                    value={currentValue}
                    formatter={formatter}
                    onChange={this.saveChanges}
                />
            </div>
        );
    }

    renderReadOnly() {
        const { value, key } = this.state;

        return <div key={key} className="table-cell string-value">{value}</div>;;
    }


    render() {
        return this.isEditable() ? this.renderEditable() : this.renderReadOnly()
    }

}

export default withStackEvents(NumberCell)