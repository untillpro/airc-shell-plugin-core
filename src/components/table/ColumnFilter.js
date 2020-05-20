/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';

/**
 * Component represents filte mechanics for EMList columns
 * 
 * TODO
 */

class ColumnFilter extends Component {
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
        return null;
    }

    render() {
        // const { filterInfo } = this.props;
        // const { filter, onChange } = filterInfo;

        return (
            <div className='btn bordered full'>
                Filter

                {this.renderFitler()}
            </div>
        );
    }
}

export default ColumnFilter;
