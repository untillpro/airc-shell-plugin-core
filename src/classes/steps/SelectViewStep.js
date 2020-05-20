/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import StateMachineStep from '../StateMachineStep';

import RenderViewStep from './RenderViewStep'; 

import { MessageInit } from '../messages';

class SelectViewStep extends StateMachineStep {
    getName() {
        return 'SelectViewStep';
    }

    MessageInit(msg, context) {
        const { view } = context;

        if (view) {
            return {
                newStep: new RenderViewStep(),
                message: new MessageInit()
            };
        }

        return null;
    }

    MessageSelectView(msg) {
        const { view } = msg;

        if (view && typeof view === 'string') {
            return {
                newStep: new RenderViewStep(),
                changedData: {
                    view
                }
            };
        }
    }
}

export default SelectViewStep; 
