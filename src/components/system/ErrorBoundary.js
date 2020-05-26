/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import ApiContext from '../../context/ApiContext';

import {
    Button,
    Message
} from '../../base/components';

import {
    sendCancelMessage
} from '../../actions/';

class ErrorBoundary extends Component {
    constructor() {
        super();

        this.state = {
            hasError: false,
            error: null
        };
    }

    setError(error, info) {
        const { step } = this.props;

        this.setState({
            hasError: true,
            error,
            info,
            errorStep: step
        });
    }

    dropError() {
        this.setState({
            errorStep: null,
            hasError: false,
            error: null
        });
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        const { step } = this.props;
        const { errorStep } = this.state;

        if (step !== errorStep) {
            this.dropError();
        }
    }

    componentDidCatch(error, info) {
        this.setError(error, info);

        this.apiGate.sendError(error.toString());
        this.props.sendCancelMessage();
    }

    renderError() {
        const { error } = this.state;

        return (
            <Message
                header={"Air Shell Exception"}
                footer={
                    <Button 
                        onClick={() => this.dropError()}
                        text="Ok"
                    />
                }

                footerAlign="right"
            >
                <div className="error-text">
                    {error.toString()}
                </div>
            </Message>
        );
    }

    renderWithContext(api) {
        this.apiGate = api;
        
        const { hasError } = this.state;

        if (hasError) {
            return this.renderError();
        } 

        return this.props.children;
    }


    render() {
        return (
            <ApiContext.Consumer>
                {(api) => this.renderWithContext(api)}
            </ApiContext.Consumer>
        );
    }
}

const mapStateToProps = (state) => {
    const { step } = state.plugin;
    
    return { step };
};

export default connect(mapStateToProps, {
    sendCancelMessage
})(ErrorBoundary);