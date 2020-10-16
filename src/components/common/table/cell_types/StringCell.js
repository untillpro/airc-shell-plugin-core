/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import React, { PureComponent } from 'react';
import { withStackEvents } from 'stack-events';
import { Input } from 'airc-shell-core';
import { EditOutlined, LoadingOutlined } from '@ant-design/icons';
import { KEY_RETURN, KEY_ESCAPE } from 'keycode-js';

class StringCell extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            edit: false,
            saving: false,
            currentValue: null,
            value: null
        };

        this.ref = null;

        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
    }

    componentDidMount() {
        const { value } = this.props;

        this.setState({
            currentValue: value,
            value: value,
            key: this.key()
        })
    }

    componentDidUpdate() {
        if (this.props.value !== this.state.value) {
            this.setState({ value: this.props.value, currentValue: this.props.value })
        }
    }
   
    key() {
        const { nestingPath } = this.props.cell;
        const { value } = this.state;

        if (nestingPath && _.isArray(nestingPath)) {
            return `string.value.${nestingPath.join(".")}.${value}`;
        } else {
            return `string.value.${value}`;
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

    handleKeyDown(event) {
        switch (event.keyCode) {
            case KEY_RETURN:
                this.saveChanges();
                return;
            case KEY_ESCAPE:
                this.blur();
                return;
            default:  return;
        }
    }

    handleChange(event) {
        const val = event.target.value;

        this.setState({ currentValue: val });
    }

    blur() {
        if (this.ref) {
            this.ref.blur();
        }
    }
    /*
     - "onSave" function should be async //TODO
     - throw error? mb use of onError callback from parent component //TOFIX
    */

    saveChanges() {
        const { onSave, cell, prop } = this.props;
        const { _entry } = cell.original;
        const { value, currentValue, saving } = this.state;

        if (saving) return;

        if (_.isFunction(onSave) && _.isObject(_entry)) {
            if (value !== currentValue) {
                this.setState({ saving: true });

                onSave(currentValue, prop, _entry)
                    .then(() => {
                        this.setState({ value: currentValue, saving: false });
                        //this.blur();
                    })
                    .catch(() => {
                        this.setState({ saving: false });
                    });
            }
        }
    }

    isEditable() {
        return this.props.editable === true
    }

    renderEditable() {
        const { currentValue, saving, key } = this.state;

        return (
            <div key={key} className="table-cell string-value ediatable">
                <Input
                    ref={ref => this.ref = ref}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    onClick={(event) => event.stopPropagation()}
                    defaultValue={currentValue}
                    value={currentValue}
                    prefix={<span className="cell-icon left">{saving ? <LoadingOutlined /> : <EditOutlined />}</span>}
                    bordered={false}
                    onChange={this.handleChange}
                />
            </div>
        );
    }

    renderReadOnly() {
        const { value } = this.props;
        const { key } = this.state;

        let val = '';

        if (value) {
            val = value.toString();
        }

        return (<div key={key} className="table-cell string-value">{val}</div>);
    }

    render() {
        if (this.isEditable()) {
            return this.renderEditable();
        }

        return this.renderReadOnly();
    }
}

export default withStackEvents(StringCell);