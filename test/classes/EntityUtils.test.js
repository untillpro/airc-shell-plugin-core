/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import * as Utils from "../../src/classes/EntityUtils";
import Data from '../data/department_data.json';

test('applyClassifiers test #1', () => {
    let res = Utils.applyClassifiers(Data, 'department');
});
