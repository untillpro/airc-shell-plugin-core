/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { Component } from 'react';
import { connect } from 'react-redux';
import isProd from 'is-prod';

import {
    initPlugin,
    setContext,
    setLanguage,
    sendData,
    sendSelectViewMessage
} from '../../actions/';

import { UShellAPIGate } from 'airc-shell-core';
import MockAlphaApiGate from '../../mock/MockAlphaApiGate';

class ApiProvider extends Component {
    componentDidMount() {
        const API = {
            selectView: (view) => this._selectView(view),
            setLanguage: (lang) => this._setLanguage(lang),
            init: (payload) => this._init(payload)
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
        const { api } = this.props;

        if (!message) return null;

        const { text = '', description = '' } = message;

        switch (type) {
            case 'success': api.sendSuccess(text, description); break;
            case 'warning': api.sendWarning(text, description); break;
            case 'error': api.sendError(text, description); break;

            default: api.sendInfo(text, description);
        }
    }

    _init(payload) {
        this.props.initPlugin(payload);
    }

    _setLanguage(lang) {
        this.props.setLanguage(lang)
    }

    _selectView(view) {
        const { locations } = this.props;
        
        this.props.sendSelectViewMessage(view, locations); 
    }

    render() {
        return this.props.children;
    }
}

const mapStateToProps = (state) => {
    const { api } = state.context;
    const { info, error, warning, success } = state.messages;
    const { locations } = state.locations;

    return { api, info, error, warning, success, locations };
};

export default connect(mapStateToProps, { 
    initPlugin,
    setLanguage,
    setContext,
    sendData, 
    sendSelectViewMessage
})(ApiProvider);
