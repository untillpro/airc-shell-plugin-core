/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { Component } from 'react';
import { connect } from 'react-redux';
import isProd from 'is-prod';

import {
    setContext,
    sendData,
    sendSelectViewMessage
} from '../../actions/';

import UShellAPIGate from '../../base/classes/UShellAPIGate';
import MockAlphaApiGate from '../../mock/MockAlphaApiGate';

class ApiProvider extends Component {
    componentDidMount() {
        const API = {
            selectView: (view) => this._selectView(view)
        };

        let apiGate = null;

        if (isProd.isProduction()) {
            apiGate = new UShellAPIGate(API);
        } else {
            apiGate = new MockAlphaApiGate();
        }

        this.props.setContext("api", apiGate)
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
        this.props.sendSelectViewMessage(view); 
    }

    render() {
        return this.props.children;
    }
}

const mapStateToProps = (state) => {
    const { info, error, warning, success } = state.messages;

    return { info, error, warning, success };
};

export default connect(mapStateToProps, { 
    setContext,
    sendData, 
    sendSelectViewMessage
})(ApiProvider);
