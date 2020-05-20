import * as Utils from "../../src/classes/EntityUtils";
import Data from '../data/department_data.json';

test('applyClassifiers test #1', () => {
    console.log(Data);

    let res = Utils.applyClassifiers(Data, 'department');

    console.log(res);
});
