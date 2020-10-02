/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import { Input } from 'antd';

class StringCell extends PureComponent {

    constructor(props) {
        super(props);
        
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        const { value } = this.props;
        
        const val = event.target.val;

        if (val !== value) {
            console.log("StringCell.handleChange: ", value, event.target.value);
            console.log("StringCell.oldValue = ", value);
            console.log("StringCell.newValue = ", val);
        }
        
    }

    isEditable() {
        return this.props.editable === true
    }

    renderEditable() {
        const { value } = this.props;
        let val = '';
    
        if (value) {
            val = value.toString();
        }

        return <Input 
            defaultValue={val} 
            onPressEnter={this.handleChange}
        />
    }

    renderReadOnly() {
        const { value,  } = this.props;
        let val = '';
    
        if (value) {
            val = value.toString();
        }
    
        return <span className="table-cell string-value">{val}</span>;
    }

    render() {
        if (this.isEditable()) {
            return this.renderEditable();
        }

        return this.renderReadOnly();
    }
}

export default StringCell;