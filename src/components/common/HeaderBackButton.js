/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';

class HeaderBackButton extends Component {
    handleClick() {
        const { onClick } = this.props;

        if (onClick && typeof onClick === 'function') {
            onClick();
        }
    }

    render() {
        return (
            <div 
                className='content-header-back' 
                onClick={this.handleClick.bind(this)}
            >
                <i className='icon-arrow-left' />
            </div>
        );
    }
}

export default HeaderBackButton;