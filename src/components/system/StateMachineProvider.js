/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { Component } from 'react';
import { connect } from 'react-redux';

import StateMachine from '../../classes/StateMachine';
//import * as Messages from 'classes/StateMachine/messages';
import { RootStep } from '../../classes/steps/';

import {
    setContext,
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

    componentDidMount() {
        this.props.setContext("sm", this.stateMachine);
    }

    shouldComponentUpdate(nextProps) {
        //checks whether message in next props are other message than message in current props
        if (this.props.message !== nextProps.message) return true;

        return false;
    }

    render() {
        const { context, message, isGlobal, shouldPop } = this.props;
        const { api } = context;
        /**
         * if message was specified then send it to state machine
         */

        //TODO - remove state from messages
        
        if (message) {
            let promise = null;

            if (isGlobal) {
                promise = this.stateMachine.sendGlobalMessage(message, context, shouldPop);
            } else {
                promise = this.stateMachine.sendMessage(message, context);
            }

            promise
                .then((data) => {
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
}

const mapStateToProps = (state) => {
    const { message, isGlobal, shouldPop } = state.machine;
    const { contributions, api } = state.context;
    return { 
        context: { contributions, api },
        message, 
        isGlobal, 
        shouldPop 
    };
};

const mapDispatchToProps = {
    setContext,
    sendStateMachineResult
};

export default connect(mapStateToProps, mapDispatchToProps)(StateMachineProvider);
