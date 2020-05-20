/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import StateMachineStep from '../StateMachineStep';

import SelectViewStep from './SelectViewStep'; 

import { MessageInit } from '../messages';

class RootStep extends StateMachineStep {
    getName() {
        return 'RootStep';
    }

    MessageInit() {
        return {
            newStep: new SelectViewStep(),
            message: new MessageInit()
        };
    }
}

export default RootStep; 
