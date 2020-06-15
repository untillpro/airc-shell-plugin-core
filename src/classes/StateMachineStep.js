/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { MessageDrop } from './messages';

export default class StatemachineStep {
    constructor(parent = null, childs = [], result = null) {
        this.parent = parent; 
        this.childs = childs; 
        this.result = result; 
    }

    async MessageDrop(msg) {
        const { step } = msg;

        if (step !== this.getName()) {
            return {
                pop: true,
                message: new MessageDrop()
            };
        } 
    }
    
    canAcceptMessage(msg) { 
        let messageName = msg;
        
        if (typeof msg === 'object') {
            messageName = msg.getName();
        }

        return typeof this[messageName] === 'function';
    }

    getStackPropertyByName(propName) {
        if (this[propName] && typeof this[propName] !== 'function') {
            return this[propName];
        }

        if (this.parent !== null) {
            return this.parent.getStackPropertyByName(propName);
        }

        return null;
    }
    
    getName() {
        this.error(`${this.constructor.name}: you should redeclare GetName() method`);
    }

    detouch() {
        console.error(
            `${this.getName()} was detouched. If u see this message you possible should redeclare Detouch() method.`
        );
    }
    
    error(message, ...args) {
        console.error(`${this.getName()} error occured. ${message} `, args);
        throw new Error(`${message}. View logs for more details.`);
    }
}
