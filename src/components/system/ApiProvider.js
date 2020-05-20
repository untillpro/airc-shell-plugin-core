/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import ApiContext from 'context/ApiContext';

import {
    sendData,
    sendSelectViewMessage
} from 'actions';

import isProd from 'is-prod';

import UShellAPIGate from 'base/classes/UShellAPIGate'; //enable on production 
//import MockUShellAPIGate from 'mock/MockApiGate';
import MockAlphaApiGate from 'mock/MockAlphaApiGate';

class ApiProvider extends Component {
    constructor() {
        super();
        
        this.apiGate = null;
    }

    componentDidUpdate(oldProps) {
        const { info, error, warning, success } = this.props;

        if (info !== oldProps.info) this.sendMessage(oldProps.info, 'info');
        
        if (success !== oldProps.success) this.sendMessage(oldProps.success, 'success');

        if (error !== oldProps.error) this.sendMessage(oldProps.error, 'error');

        if (warning !== oldProps.warning) this.sendMessage(oldProps.warning, 'warning');
    }

    sendMessage(message, type) {
        const { apiGate } = this;

        if (!message) return null;

        const { text = '', description = '' } = message;

        switch (type) {
            case 'success': apiGate.sendSuccess(text, description); break;
            case 'warning': apiGate.sendWarning(text, description); break;
            case 'error': apiGate.sendError(text, description); break;

            default: apiGate.sendInfo(text, description);
        }
    }

    _selectView(view) {
        console.log("BO ApiProvider._selectView()", view);
        this.props.sendSelectViewMessage(view); 
    }

    render() {
        const API = {
            selectView: (view) => this._selectView(view)
        };

        if (isProd.isProduction()) {
            this.apiGate = new UShellAPIGate(API);
        } else {
            this.apiGate = new MockAlphaApiGate();
        }

        return (
            <ApiContext.Provider value={this.apiGate}>
                {this.props.children}
            </ApiContext.Provider>
        );
    }
}

const mapStateToProps = (state) => {
    const { info, error, warning, success } = state.messages;

    return { info, error, warning, success };
};

export default connect(mapStateToProps, { 
    sendData, 
    sendSelectViewMessage
})(ApiProvider);
