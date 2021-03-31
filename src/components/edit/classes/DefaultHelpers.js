/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

function condition(prop, value, options) {
    if (this.settings && this.settings[prop] === value) {
        return options.fn(this);
    }

    return '';
};

function attribute(prop, name) {
    if (this.settings && this.settings[prop])
        return `${name}="${this.settings[prop]}"`;

    return '';
};

function value(prop, dflt = null) {
    if (this.settings && this.settings[prop]) {
        return this.settings[prop];
    } else if (dflt && typeof dflt !== 'object') {
        return dflt;
    }

    return '';
};

const DefaultHelpers = {
    condition,
    attribute,
    value
};

export default DefaultHelpers;