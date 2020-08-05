/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { selectLocations } from '../../../../selectors';

const LocationCell = (props) => {
    const { value } = props;

    const locations = useSelector(selectLocations)

    const location = locations[value] ? locations[value] : value;

    return <span className="table-cell location-value">{location}</span>; 
}

export default React.memo(LocationCell)