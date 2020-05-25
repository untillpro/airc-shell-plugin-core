/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import StateMachine from '../../classes/StateMachine';
//import * as Messages from 'classes/StateMachine/messages';
import { RootStep } from '../../classes/steps/';

import ApiContext from '../../context/ApiContext';

import {
    sendStateMachineResult
} from '../../actions/';

class StateMachineProvider extends Component {
    constructor() {
        super();

        //state machine initializing
        this.stateMachine = new StateMachine();

        // root state of state machine is added manually
        this.stateMachine.add(new RootStep());
    }

    shouldComponentUpdate(nextProps) {
        //checks whether message in next props are other message than message in current props
        if (this.props.message !== nextProps.message) return true;

        return false;
    }

    renderWithContext(api) {
        const { message, state, manager, isGlobal, shouldPop } = this.props;
        
        /**
         * if message was specified then send it to state machine
         * 
         * state.bo - context for state machine
         */
        if (message) {
            const context = {
                api,
                state: state.bo,
                contributions: manager
            };

            let promise = null;

            if (isGlobal) {
                promise =  this.stateMachine.sendGlobalMessage(message, context, shouldPop);
            } else {
                promise = this.stateMachine.sendMessage(message, context);
            }
            
            promise.then((data) => {
                    this.props.sendStateMachineResult(
                        this.stateMachine.getCurrenStepName(),
                        data
                    );

                    // if response has errors will send error to shell
                    if (data.error) { 
                        api.sendError(data.error);
                    }
                })
                .catch((e) => { 
                    // if request crashed will send error to shell
                    api.sendError(e);
                });
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

StateMachineProvider.propTypes = {
    children: PropTypes.node,
    message: PropTypes.object,
    state: PropTypes.object,
    sendStateMachineResult: PropTypes.func
};

const mapStateToProps = (state) => {
    const { message, isGlobal, shouldPop } = state.machine; 

    return { state, message, isGlobal, shouldPop };
};

export default connect(mapStateToProps, { 
    sendStateMachineResult
})(StateMachineProvider);
