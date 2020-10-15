/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

class IContributor {
    /**
     * 
     * @param {ContributionManager} manager - use manager to register contributions
     * 
     */

    register() {
        throw new Error(`Class ${this.constructor.name} should implement register() method`);
    }

    entity() {
        throw new Error(`Class ${this.constructor.name} should implement entity() method`);
    }
}

export default IContributor;
