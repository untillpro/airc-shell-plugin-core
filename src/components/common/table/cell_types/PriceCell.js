/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import EditableCell from './EditableCell';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
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

const mapStateToProps = (state) => {
    const { currency, defaultCurrency } = state.options;
    
    return { currency, defaultCurrency };
}

export default connect(mapStateToProps, null)(PriceCell)
