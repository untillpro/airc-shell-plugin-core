/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import PropTypes from 'prop-types';
import Point from './Point';

class ContibutionManager {
    constructor() {
        this.points = {};
        this.prefetched = {};
    }

    registerPoint(type, pointName) {
        if (!this.points[type]) {
            this.points[type] = {};
        }

        if (!this.points[type][pointName]) {
            this.points[type][pointName] = new Point(pointName);
            return true;
        }

        return false;
    }

    registerContribution(type, pointName, name, contribution) {
        if (!this.prefetched[type]) {
            this.prefetched[type] = {};
        }

        if (!this.prefetched[type][pointName]) {
            this.prefetched[type][pointName] = {};
        }

        if (this.prefetched[type][pointName][name]) {
            if (_.isFunction(contribution) && _.isFunction(this.prefetched[type][pointName][name])) {
                this.prefetched[type][pointName][name] = contribution
            } else if (_.isArray(this.prefetched[type][pointName][name]) && !_.isFunction(contribution)) {
                if (_.isArray(contribution)) {
                    this.prefetched[type][pointName][name] = [ ...this.prefetched[type][pointName][name], ...contribution];
                } else {
                    this.prefetched[type][pointName][name].push(contribution);
                }
            }
        } else {
            if (_.isFunction(contribution) || _.isArray(contribution)) {
                this.prefetched[type][pointName][name] = contribution;
            } else {
                this.prefetched[type][pointName][name] = [ contribution ];
            }
        }
    }

    getPoint(type, name) {
        if (this.points && this.points[type] && this.points[type][name]) {
            return this.points[type][name];
        }

        return null;
    }

    getPoints(type) {
        if (this.points && this.points[type]) {
            return Object.keys(this.points[type]);
        }

        return null;
    }

    getPointContributions(type, pointName) {
        if (this.points && this.points[type] && this.points[type][pointName]) {
            return this.points[type][pointName].getContributuions();
        }

        return undefined;
    }

    /**
     * 
     * @param {*} type 
     * @param {*} pointName 
     * 
     * return only first value of pointName contributions if contributions is array; else returns a contributions;
     */

    getPointContributionValue(type, pointName, contribution) {
        if (this.points && this.points[type] && this.points[type][pointName]) {
            return this.points[type][pointName].getContributuionValue(contribution);
        }

        return undefined;
    }

    getPointContributionValues(type, pointName, contribution) {
        if (this.points && this.points[type] && this.points[type][pointName]) {
            return this.points[type][pointName].getContributuionValue(contribution, true);
        }

        return undefined;
    }

    resolve() {
        if (this.prefetched && _.size(this.prefetched) > 0) {
            _.each(this.prefetched, (points, type) => {
                _.each(points, (obj, pointName) => {
                    if (!this.points[pointName]) {
                        this.registerPoint(type, pointName);
                    }
        
                    _.each(obj, (value, name) => {
                        this.points[type][pointName].registerContribution(name, value);
                    });
                });
            });
        }

        this.prefetched = {};
    }

    // ???
    /*
    resolve() {
        _.each(this.prefetched, (obj, key) => {
            if (!this.points[key]) {
                this.registerPoint(key);
            }

            _.each(obj, (value, name) => {
                this.points[key].registerContribution(name, value);
            });
        });
        
        this.prefetched = {};
    }
    */
}

ContibutionManager.propTypes = {
    points: PropTypes.objectOf(PropTypes.instanceOf(Point))
};

export default ContibutionManager;
