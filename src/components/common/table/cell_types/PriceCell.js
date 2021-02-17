/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import EditableCell from './EditableCell';
import React, { PureComponent } from 'react';
import { formatPriceValue } from '../../../../classes/helpers';

class PriceCell extends PureComponent {
    constructor(props) {
        super(props);

        this.format = this.format.bind(this);
    }

    value(value) {
        return Number(value);
    }

    format(value) {
        const { currency, defaultCurrency } = this.props;
        return formatPriceValue(value, currency || defaultCurrency)
    }

    render() {
        const { value } = this.props;

        if (value === undefined || value === null) {
            return " - ";
        }

        return (
            <EditableCell 
                {...this.props} 
                formatter={this.format} 
                preparearer={this.value}
                type="number" 
            />
        );
    }
}

export default PriceCell;
