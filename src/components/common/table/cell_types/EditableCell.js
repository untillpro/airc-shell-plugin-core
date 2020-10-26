/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStackEvents } from 'stack-events';
import { Input } from 'airc-shell-core';

import { KEY_RETURN, KEY_ESCAPE } from 'keycode-js';
// как форматировать?

class EditableCell extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            edit: false,
            loading: false,
            initValue: null,
            value: null
        };

        this.ref = null;

        this.edit = this.edit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        this.setState({
            value: this.props.value,
            initValue: this.props.value
        });
    }

    componentDidUpdate(oldProps, oldState) {
        if (this.props.value !== oldProps.value) {
            this.setState({ value: this.props.value, initValue: this.props.value })
        }

        if (oldState.edit !== this.state.edit && this.state.edit === true) {
            this.ref.focus();
        }
    }

    handleKeyDown(event) {
        switch (event.keyCode) {
            case KEY_RETURN: this.save(); break;
            case KEY_ESCAPE: this.ref.blur(); break;

            default: return null;
        }
    }

    handleFocus() {
        this.props.pushEvents({
            "keydown": this.handleKeyDown
        });
    }

    handleBlur() {
        console.log('blur of editableCell');
        this.cancel();
    }

    handleChange(event) {
        const { type } = this.props;

        let value = event.target.value;

        if (type === 'number') {
            if (!_.isNaN(Number(value))) {
                this.setState({ value });
            }
        } else {
            this.setState({ value });
        }
    }

    edit(event) {
        event.stopPropagation();
        event.preventDefault();

        this.setState({ edit: true });
    }

    cancel(props = {}) {
        const { initValue } = this.state;

        this.setState({
            edit: false,
            value: initValue,
            ...props
        });

        this.props.popEvents();
    }

    save() {
        const { onSave, entity, prop, prepareValue, entry } = this.props;
        const { value, initValue, edit, loading } = this.state;

        if (!edit || loading) return;

        if (_.isFunction(onSave) && _.isObject(entry)) {
            if (value !== initValue) {
                this.setState({ loading: true });

                const v = _.isFunction(prepareValue) ? prepareValue(value) : value;

                onSave(v, entity, prop, entry)
                    .then(() => {
                        this.cancel({ initValue: value, value, loading: false })

                    })
                    .catch((e) => {
                        this.error(e);
                        this.setState({ loading: false });
                    });
            }
        }
    }

    error(e) {
        const { onError } = this.props;

        if (_.isFunction(onError)) {
            onError(e);
        }
    }

    format(value) {
        const { formatter } = this.props;

        if (_.isFunction(formatter)) {
            return formatter(value);
        }

        return value;
    }

    renderValue() {
        const { editable } = this.props;
        const { value, edit, loading } = this.state;

        if (edit) {
            let disabled = loading === true;

            return (
                <Input
                    className="value-input"
                    ref={ref => this.ref = ref}
                    onClick={(event) => event.stopPropagation()}
                    defaultValue={value}
                    value={value}
                    bordered={false}
                    disabled={disabled}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    size="small"
                />
            );
        }

        if (editable) {
            return (
                <span
                    className="value editable"
                    onClick={this.edit}
                >
                    {this.format(value)}
                </span>
            );
        }

        return (<span className="value">{this.format(value)}</span>);
    }

    render() {
        return (
            <div className="table-editable-cell">
                {this.renderValue()}
            </div>
        );
    }
}

EditableCell.protoTypes = {
    type: PropTypes.string,
    entity: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    onSave: PropTypes.func.isRequired,
    onError: PropTypes.func,
    editable: PropTypes.bool
};

export default withStackEvents(EditableCell);