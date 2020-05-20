/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';

function makeGenerator() {
    var currentCount = 1;
  
    return function() {
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
  
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  
    return mergeDeep(target, ...sources);
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

    if ( mbytes > 0 ) {
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



