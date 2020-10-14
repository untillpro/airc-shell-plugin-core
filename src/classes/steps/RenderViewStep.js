/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import StateMachineStep from '../StateMachineStep';

import RenderEntityStep from './RenderEntityStep'; 
import ReportViewStep from './ReportViewStep'; 
import { MessageInit, MessageNotify } from '../messages';

class RenderViewStep extends StateMachineStep {
    getName() {
        return 'RenderViewStep';
    }

    MessageInit(msg) {
        const { entity } = msg;

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
                message: new MessageInit(msg),
                changedData: {
                    entity
                }
            };
        }
    }

    MessageGenerateReport(msg, context) {
        return {
            newStep: new ReportViewStep(),
            message: new MessageInit(msg),
        };
    }

    MessageCancel() {
        return {
            pop: true,
            message: new MessageNotify()
        };
    }
}

export default RenderViewStep; 
