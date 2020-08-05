/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { selectSystemCurrency } from '../../../../selectors';
import { formatPriceValue } from '../../../../classes/Utils';

const PriceCell = (props) => {
    const { value } = props;

    const currency = useSelector(selectSystemCurrency)
    
    const formatedValue = formatPriceValue(value, currency)

    return <span className="table-cell price-value">{formatedValue}</span>; 
}

export default React.memo(PriceCell)