/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component, Fragment } from 'react';

import { Modal, TextInput, Icon } from '../../../base/components';
import EmbeddedManagerSelectField from './EmbeddedManagerSelectField'


class EmbededSelectorField extends Component {
    constructor() {
        super();

        this.state = {
            open: false
        };
    }

    handleChange(value) {
        const { onChange } = this.props;

        if (onChange && typeof onChange === 'function' ) {
            let val = value;

            onChange(val);
        }
    }

    handleItemSelect(value) {
        this.handleChange(value);

        this.setState({
            open: false
        });
    }

    handleKeyPress(event) {
        event.preventDefault();
        
        if (event.keyCode === 8) {
            this.handleChange(null);
        }
        return false;
    }

    getComponentProps() {
        const { field } = this.props;
        const props = {};

        if (!field) return props;

        const {
            allowClear,
            addonAfter,
            addonBefore,
            prefix,
            size,
            suffix,
            maxLength
        } = field;
        
        props.allowClear = !(allowClear === false);

        if (maxLength && maxLength >= 1) props.maxLength = parseInt(maxLength);
        if (addonAfter) props.addonAfter = addonAfter;
        if (addonBefore) props.addonBefore = addonBefore;
        if (prefix) props.prefix = prefix;
        if (suffix) props.suffix = suffix;
        if (size) props.size = ['small', 'default', 'large'].indexOf(size) >= 0 ? size : 'default';
        
        return props;
    }

    getInputValue() {
        const { value, field } = this.props;

        if (!field) return value;

        const {
            text_accessor
        } = field;

        if (text_accessor && typeof text_accessor === 'string' && value && typeof value === 'object') {
            return value[text_accessor] || '';
        }

        return value;
    }

    openSelector() {
        this.setState({ open: true });
    }

    handleModalCancel() {
        this.setState({ open: false })
    }

    handleModalOk() {
        if (this.manager) {
            this.manager.doSelect();
        }

    }

    renderSelector() {
        const { context, field, locations } = this.props;
        const { open } = this.state;

        if (open) {
            return (
                <Modal
                    visible
                    onCancel={() => this.handleModalCancel()}
                    onOk={() => this.handleModalOk()}
                    width={"80%"}
                    className="edit-form-modal"
                >
                    <EmbeddedManagerSelectField 
                        locations={locations}
                        field={field}
                        context={context}
                        ref={ref => this.manager = ref}

                        onRowSelect={(item) => {
                            this.handleItemSelect(item);
                        }}
                    />
                </Modal>
            )
        }

        return null;
    }

    render() {
        const { disabled } = this.props;
        const props = this.getComponentProps();

        const inputValue = this.getInputValue();

        return (
            
            <Fragment>
                <TextInput 
                    disabled={disabled}
                    className="selector-input"
                    {...props}
                    //allowClear={false}
                    addonAfter={
                        <Icon type="ellipsis" onClick={() => this.openSelector()} />
                    }
                    value={inputValue}
                    onKeyDown={(event) => this.handleKeyPress(event)}
                    onDoubleClick={() => this.openSelector()}
                />

                {this.renderSelector()}
            </Fragment>
        )
    }
}

export default EmbededSelectorField;