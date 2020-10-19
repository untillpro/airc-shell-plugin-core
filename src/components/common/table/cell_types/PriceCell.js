/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash'
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { useSelector } from 'react-redux';
import { InputNumber } from 'airc-shell-core';
import { withStackEvents } from 'stack-events';
import { selectSystemCurrency } from '../../../../selectors';
import { formatPriceValue } from '../../../../classes/helpers';

class PriceCell extends PureComponent {
    constructor() {
        super();

        this.handleSave = this.handleSave.bind(this);
    }

    handleSave(value) {
        const { onSave, cell, prop } = this.props;
        const { _entry } = cell.original;

        onSave(value, prop, _entry, cell);
    };


    render() {
        const { value, editable, currency, defaultCurrency } = this.props;

        if (_.isNil(value)) return <span className="table-cell">-</span>;

        
        if (editable === true) {
            return (
                <InputNumber
                    onClick={(event) => event.stopPropagation()}
                    defaultValue={value}
                    value={value}
                    formatter={(value) => formatPriceValue(value, currency || defaultCurrency)}
                    onChange={this.handleSave}
                />
            );
        }

        const formatedValue = formatPriceValue(value, currency)

        return <span className="table-cell price-value">{formatedValue}</span>;
    }
}

const mapStateToProps = (state) => {
    const { currency, defaultCurrency } = state.options;
    
    return { currency, defaultCurrency };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withStackEvents(PriceCell))
