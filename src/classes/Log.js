/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import isProd from 'is-prod';

export default (...args) => {
    if (isProd.isDevelopment()) 
        console.log(...args);
};