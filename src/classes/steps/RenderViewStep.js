/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import StateMachineStep from '../StateMachineStep';

import RenderEntityStep from './RenderEntityStep'; 
import { MessageInit, MessageNotify } from '../messages';

class RenderViewStep extends StateMachineStep {
    getName() {
        return 'RenderViewStep';
    }

    MessageInit(msg, context) {
        const { entity } = context;

        if (entity && typeof entity === 'string') {
            return {
                newStep: new RenderEntityStep(),
                message: new MessageInit({entity})
            };
        }

        return null;
    }

    MessageSelectEntity(msg) {
        const { entity } = msg;

        if (entity && typeof entity === 'string') {
            return {
                newStep: new RenderEntityStep(),
                message: new MessageInit({entity}),
                changedData: {
                    entity
                }
            };
        }
    }

    MessageCancel() {
        return {
            pop: true,
            message: new MessageNotify()
        };
    }
}

export default RenderViewStep; 
