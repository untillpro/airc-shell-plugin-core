/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';

import {
    NumberFilter,
    RangeFilter,
    SelectFilter,
    StringFilter,
    GroupFilter,
    DateTimeFilter,
} from './filter_types';

/**
 * Component represents filte mechanics for EMList columns
 * 
 * TODO
 */

class ColumnFilter extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            opened: false
        };
    }

    handleClick() {
        const { opened } = this.state;

        this.setState({ opened: !opened });
    }

    renderFitler() {
        const { onChange, column } = this.props;
        const { type, filterType } = column;

        let checkType = filterType || type;

        switch (checkType) {
            //case "number": return <NumberFilter column={column} onChange={onChange} />;
            //case "select": return <SelectFilter column={column} onChange={onChange} />;
            //case "price": return <RangeFilter column={column} onChange={onChange} />;
            //case "range": return <RangeFilter column={column} onChange={onChange} />;
            //case "group": return <GroupFilter column={column} onChange={onChange} />;

            //case "date": 
            //case "time": 

            default: return <StringFilter column={column} onChange={onChange} />;
        }
    }

    render() {
        const { column: { filterable }} = this.props;

        console.log("ListColumnFilter props: ", this.props);

        if (filterable !== true) return null;

        

        return (
            <div>
                {this.renderFitler()}
            </div>
        );
    }
}

export default ColumnFilter;
