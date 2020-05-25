/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import PropTypes from 'prop-types';

class ContributionPoint {
    constructor(name) {
        if (!name) throw new Error('ContributionPoint should have name');

        this.name = name;
        this.contributions = {};
    }

    registerContribution(name, contribution) {
        const { contributions } = this;

        if (contributions[name]) {
            if (!_.isArray(contributions[name])) {
                this.contributions[name] = [ contributions[name] ];
            } 
            this.contributions[name].push(contribution);
        } else {
            if (_.isArray(contribution)) {
                this.contributions[name] = contribution;
            } else {
                this.contributions[name] = [ contribution ];
            }
        }
    }

    getContributuions() {
        return this.contributions;
    }

    getContributuionValue(name) {
        if (this.contributions[name]) {
            const contribution = this.contributions[name];

            if (_.isArray(contribution)) {
                return contribution[0];
            }

            return contribution;
        }

        return null;
    }
}

ContributionPoint.propTypes = {
    name: PropTypes.string.isRequired,
    contributions: PropTypes.node
};

export default ContributionPoint;
