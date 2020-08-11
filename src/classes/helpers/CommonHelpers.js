/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import log from '../../base/classes/Logger';

export const checkColumnDeclaration = (declaration) => {
    if (!_.isPlainObject(declaration)) return false;

    const { Header, accessor } = declaration;

    if (!Header || typeof Header !== 'string') {
        log.error(`column field "Header" wrong specified; string is expected but got `, typeof Header)
        return false;
    }

    if (!accessor || (typeof accessor !== 'string' && typeof accessor !== 'function')) {
        log.error(`column field "accessor" wrong specified; string is expected but got `, typeof accessor)
        return false;
    }

    return true;
}