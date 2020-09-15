/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';

function makeGenerator() {
    var currentCount = 1;

    return function () {
        return currentCount++;
    };
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
                Object.assign(target, { [key]: _.merge(target[key], source[key])});
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

