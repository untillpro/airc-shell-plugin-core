/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import React, { PureComponent } from 'react';
import { Checkbox } from 'airc-shell-core';

class BooleanCell extends PureComponent {
    constructor() {
        super();

        this.saveChanges = this.saveChanges.bind(this);

        this.state = {
            saving: false,
            value: null,
            key: null
        };
    }

    componentDidMount() {
        const { value } = this.props;

        this.setState({ value, key: this.key() });
    }

    componentDidUpdate(oldProps) {
        if (this.props.value !== oldProps.value) {
            this.setState({value: this.props.value})
        }
    }
    
    key() {
        const { nestingPath } = this.props.cell;
        const { value } = this.state;

        if (nestingPath && _.isArray(nestingPath)) {
            return `bool.value.${nestingPath.join(".")}.${value}`;
        } else {
            return `bool.value.${value}`;
        }
    }

    saveChanges() {
        const { onSave, onError, cell, prop } = this.props;
        const { _entry } = cell.original;
        const { value } = this.state;

        if (_.isFunction(onSave) && _.isObject(_entry)) {
            onSave(Number(!value), prop, _entry, cell)
                .then(() => {
                    this.setState({ value: !value});
                })
                .catch((e) => {
                    if(_.isFunction(onError)) {
                        onError(e)
                    }
                });
        }
    }

    isEditable() {
        return this.props.editable === true
    }

    renderEditable() {
        const { value } = this.state;

        return (
            <Checkbox
                onClick={(event) => event.stopPropagation()}
                checked={!!value}
                onChange={this.saveChanges}
            />
        );
    }

    renderReadOnly() {
        const { value } = this.state;

        return (
            <Checkbox
                onClick={(event) => event.stopPropagation()}
                checked={!!value}
                disabled
            />
        );
    }

    render() {
        const { key } = this.state;

        return (
            <div key={key} className="table-cell bool-value">
                {this.isEditable() ? this.renderEditable() : this.renderReadOnly()}
            </div>
        );
    }
}

export default BooleanCell