/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import StateMachineStep from '../StateMachineStep';

import { 
    SAGA_FETCH_DASHBOARD
} from '../../sagas/Types';

class DashboardStep extends StateMachineStep {
    getName() {
        return 'DashboardStep';
    }

    MessageInit() {
        return this.fetchData();
    }

    MessageRefreshData() {
        console.log("need refresh message handler");

        return this.fetchData();
    }

    MessageSetLocations(msg, context) {
        return this.fetchData(context);
    }

    fetchData() {
        return {
            action: {
                type: SAGA_FETCH_DASHBOARD,
            }
        };
    }
}

export default DashboardStep;
