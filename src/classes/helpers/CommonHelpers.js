/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import { Logger } from 'airc-shell-core';
import { Base64 } from 'js-base64';
import i18next from 'i18next';
import Stream from '../Stream';

import {
    PERIOD_VALUE_TYPE,
    WEEK_DAY,
    PAYMENT_KIND,
    ORDER_BUTTON_TYPES
} from '../../const';

export const isValidLocations = (locations) => {
    if (!locations || !_.isArray(locations) || locations.length === 0) {
        return false;
    }

    for (let l of locations) {
        if (!_.isInteger(l) || l < 0) {
            return false;
        }
    }

    return true;
};

export const checkColumnDeclaration = (declaration) => {
    if (!_.isPlainObject(declaration)) return false;

    const { Header, accessor } = declaration;

    if (!Header || typeof Header !== 'string') {
        Logger.error(`column field "Header" wrong specified; string is expected but got `, typeof Header)
        return false;
    }

    if (!accessor || (typeof accessor !== 'string' && typeof accessor !== 'function')) {
        Logger.error(`column field "accessor" wrong specified; string is expected but got `, typeof accessor)
        return false;
    }

    return true;
}

export const generateId = makeGenerator();

export const reduce = (data, func1 = null, func2 = null) => {
    let accum = null;

    if (!func1 || typeof func1 !== 'function') return data;

    if (!func2 || typeof func2 !== 'function') {
        func2 = (value, key) => typeof value === 'object';
    }

    if (_.isArray(data)) {
        accum = [];
    } else {
        accum = {};
    }

    _.reduce(data, (result, value, key) => {
        if (func2(value, key)) result[key] = reduce(value, func1);
        else func1(result, value, key);
        return result;
    }, accum);

    return accum;
};

export const isObject = (item) => {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export const mergeDeep = (target, ...sources) => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (_.isPlainObject(target) && _.isPlainObject(source)) {
        for (const key in source) {
            if (_.isPlainObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else if (_.isArray(source[key]) && _.isArray(target[key])) {
                Object.assign(target, { [key]: _.merge([], target[key], source[key]) });
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

export const mergeExisting = (target, source) => {
    if (!_.isPlainObject(target) || !_.isPlainObject(source)) {
        throw new Error(`target and source object should be a plain objects`);
    }

    const result = { ...target };

    _.forEach(source, (value, key) => {
        if (key in result) {
            result[key] = value
        }
    });

    return result;
}

export const getFileSize = (sizeInBytes) => {
    let bytes = parseInt(sizeInBytes, 10);
    let kbytes = 0;
    let mbytes = 0;

    let unit = '';
    let unitFull = '';
    let value = '';

    if (bytes && bytes > 0) {
        kbytes = bytes / 1024 | 0;
        mbytes = kbytes / 1024 | 0;
    } else {
        return {};
    }

    if (mbytes > 0) {
        unit = 'MB';
        unitFull = "megabytes";
        value = `${mbytes}`;
    } else if (kbytes > 0) {
        unit = 'KB';
        unitFull = "kilobytes";
        value = `${kbytes}`;
    } else {
        unit = 'B';
        unitFull = "bytes";
        value = `${bytes}`;
    }

    return {
        bytes,
        kbytes,
        mbytes,
        unit,
        unitFull,
        formated: `${value} ${unit}`,
        formatedFull: `${value} ${unitFull}`
    }
}

export const formatPriceValue = (value, currency) => {
    if (currency && _.isPlainObject(currency)) {
        const { sym_alignment, symbol, round } = currency;

        if (sym_alignment === 1) {
            return (symbol ? symbol : '') + Number(value).toFixed(round || 2).toString();
        }

        return Number(value).toFixed(round || 2).toString() + (symbol ? symbol : '');
    }

    return value;
}

export const formatNumber = (amount, decimalCount = 2, decimal = ".", thousands = " ") => {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        const negativeSign = amount < 0 ? "-" : "";

        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;

        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
        console.error(e)
    }
}


function makeGenerator() {
    var currentCount = 1;

    return function () {
        return currentCount++;
    };
}

export const bufferToLangMap = (base64str) => {
    if (base64str === null) return null;

    let res = {};

    try {
        let decodedStr = Base64.toUint8Array(base64str);

        let s = new Stream(decodedStr);

        let n = s.readBigUInt();

        if (n <= 140) {
            let code;

            code = s.next();

            while (code != null) {
                let value = s.next();

                res[code] = value;

                code = s.next()
            }
        }
    } catch (e) {
        console.error(e);
        return null;
    }

    return res.length === 0 ? null : res;
}

export const langMapToBuffer = (langMap) => {
    let s = new Stream([]);

    try {
        let str = JSON.stringify(langMap);

        s.alloc(str.length * 4);

        s.writeBigInt(_.size(langMap));

        _.forEach(langMap, (value, code) => {
            s.writeBigInt(_.size(code));
            s.write(code);

            s.writeBigInt(_.size(value));
            s.write(value);
        });

        let bytes = s.bytes();
        let res = Base64.fromUint8Array(new Uint8Array(bytes));
        
        return res;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export const immutableArrayMerge = (...arrays) => {
    const resultArray = [];

    if (arrays.length > 0) {
        arrays.forEach(array => {
            if (array && array.length > 0) {
                for (let i = 0; i < array.length; i++) {
                    if ( array[i] !== undefined) {
                        resultArray[i] = array[i];
                    } 
                }
            }
        });
    }

    return resultArray;
}

export const valueFromClassifierField = (value, accessor, defaultValue) => {
    let resultValue = defaultValue !== undefined ? defaultValue : value;
    
    try {
        if (_.isPlainObject(value)) {
            let tempValue = _.get(value, accessor);
    
            if (tempValue !== undefined) {
                resultValue = tempValue;
            }
        }
    } catch (e) {
        resultValue = defaultValue || value;
    }

    return resultValue;
}

export const getPaymentKindsOptions = () => {
    const options = {};

    if (PAYMENT_KIND && _.size(PAYMENT_KIND) > 0) {
        _.forEach(PAYMENT_KIND, (v, k) => {
            const name = i18next.t(`payment_kind.${PAYMENT_KIND[k]}`);
            options[name] = parseInt(k);
        });
    }

    return options;
};

export const getWeekDay = (num) => {
    return i18next.t(`week_day.${WEEK_DAY[num]}`);
};

export const getWeekDayOptions = () => {
    const options = {};

    if (WEEK_DAY && _.size(WEEK_DAY) > 0) {
        _.forEach(WEEK_DAY, (v, k) => {
            const name = i18next.t(`week_day.${WEEK_DAY[k]}`);
            options[name] = parseInt(k);
        });
    }

    return options;
};

export const getPeriodValueType = (num) => {
    return i18next.t(`period_value_types.${PERIOD_VALUE_TYPE[num]}`);
};

export const getPeriodValueTypesOptions = () => {
    const options = {};

    if (PERIOD_VALUE_TYPE && _.size(PERIOD_VALUE_TYPE) > 0) {
        _.forEach(PERIOD_VALUE_TYPE, (v, k) => {
            const name = i18next.t(`period_value_types.${PERIOD_VALUE_TYPE[k]}`);
            options[name] = parseInt(k);
        });
    }

    return options;
};

export const getOrderButtonTypesOptions = () => {
    const options = {};

    if (ORDER_BUTTON_TYPES && _.size(ORDER_BUTTON_TYPES) > 0) {
        _.forEach(ORDER_BUTTON_TYPES, (v, k) => {
            const name = i18next.t(`order_button_types.${k}`);
            options[name] = v;
        });
    }

    return options;
}
