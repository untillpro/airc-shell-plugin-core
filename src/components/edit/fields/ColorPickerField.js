/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { Popover, Button } from 'antd';

import { ColorPicker, ColorPreview } from '../../../base/components';

class ColorPickerField extends Component {
    constructor() {
        super();

        this.state = {
            visible: false
        };
    }

    handleChange(value) {
        const { onChange } = this.props;
        
        if (onChange && typeof onChange === 'function' ) {

            const val = this.hexToValue(value);
            
            onChange(val);
        }    
    }

    handleVisibleChange(visible) {
        this.setState({visible});
    }

    valueToHex(value) {
        return value ? value.toString(16) : '000';
    }

    hexToValue(hex) {
        let val = String(hex).replace('#', '') || 0;

        return parseInt(val, 16);
    }

    getValue() {
        const { value } = this.props;

        return this.valueToHex(value);
    }

    getPicker() {
        const { field } = this.props;
        const type = field ? field.picker : 'block';
        
        return <ColorPicker 
            type={type} 
            value={this.getValue()}
            onChange={(value) => this.handleChange(value)}
        />;
    }

    render() {
        const { field, disabled } = this.props;
        const { visible } = this.state;

        if (!field) return null;

        const content = this.getPicker();
        const val = this.getValue();

        return (
            <div className="color-picker">
                <Popover 
                    placement="bottom" 
                    content={content} 
                    trigger={"click"}
                    visible={disabled ? false : visible}
                    onVisibleChange={(visible) => this.handleVisibleChange(visible)}
                >
                    <Button disabled={disabled}>
                        <ColorPreview 
                            color={val} 
                            showValue
                        />
                    </Button>
                </Popover>
            </div>
        );
    }
}
/**
 <TextInput 
                    input={{
                        addonBefore: '#',
                        addonAfter: <ColorPreview value={this.getValue()} />,
                        placeholder: "i am batman",
                        width: 100
                    }}
                    value="test"
                />
 */
export default ColorPickerField;