/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import {
    EllipsisOutlined
} from '@ant-design/icons';

import { TextInput, Modal } from 'airc-shell-core';
import EmbeddedManagerSelectField from './EmbeddedManagerSelectField'

class EmbededSelectorField extends PureComponent {
    constructor() {
        super();

        this.state = {
            open: false
        };

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.openSelector = this.openSelector.bind(this);
        this.handleSelectorChange = this.handleSelectorChange.bind(this);
    }
    
    handleChange(value) {
        const { onChange } = this.props;

        if (onChange && typeof onChange === 'function') {
            let val = value;

            onChange(val);
        }
    }

    handleSelectorChange(event) {
        if (!event.target.value) {
            this.handleChange(0);
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
            this.handleChange(0);
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

        if (!value) return '';
        if (!field) return value;

        const {
            text_accessor
        } = field;

        if (text_accessor && typeof text_accessor === 'string' && value && typeof value === 'object') {
            return value[text_accessor] || '';
        }

        return value ? value : '';
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
            <>
                <TextInput
                    disabled={disabled}
                    className="selector-input"
                    {...props}
                    //allowClear={false}
                    addonAfter={
                        <div 
                            onClick={this.openSelector.bind(this)}
                            style={{
                                height: "100%",
                                cursor: "pointer",
                                left: "0px",
                                top: "0px",
                                minWidth: "20px"
                            }}
                        >
                            <EllipsisOutlined />
                        </div>
                    }
                    value={inputValue}
                    onKeyDown={this.handleKeyPress}
                    onDoubleClick={this.openSelector}
                    //onChange={this.handleSelectorChange}
                    onChange={this.handleSelectorChange}
                />

                {this.renderSelector()}
            </>
        )
    }
}

export default EmbededSelectorField;