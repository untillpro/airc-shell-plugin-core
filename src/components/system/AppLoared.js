/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { Spin } from 'airc-shell-core';
import { CSSTransition } from 'react-transition-group';

class AppLoared extends Component {
    constructor() {
        super();

        this.state = {
            loaded: false
        };
    }

    render() {
        const { loaded } = this.state;

        setTimeout(() => {
            this.setState({
                loaded: true
            });
        }, 1000);

        return (
            <CSSTransition
                in={!loaded}
                timeout={300}
                classNames="example">
                {!loaded ? (
                    <div
                        key="appLoader"
                        style={containerStyle}
                    >
                        <Spin />
                    </div>
                ) : null}
            </CSSTransition>
        );
    }
}

const containerStyle = {
    position: 'fixed',
    backgroundColor: '#f5f8fa',

    zIndex: 1000000,

    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex'
};

export default AppLoared;