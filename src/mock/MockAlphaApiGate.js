/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import Axios from 'axios';
import { message } from 'antd';

import SProtBuilder from '../base/classes/SProtBuilder';

const operationKeys = [ 'ID', 'Type', 'ParentID', 'ParentType', /*'PartID', 'PartType',*/ 'DocID', 'DocType', 'Data'];
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjI1NTM2LCJEZXZpY2VJRCI6MSwiZXhwIjoxNTc3NTE5MDQzfQ.dXnbwFUtjcue8_LXNpir3lltj0qoDUarbZ1BDkj5Zno';

class MockAlphaApiGate {
    constructor() {
        this.host = 'https://air-alpha.untill.ru/api';
    }


    async do(queueId, resource, params, method = 'get') {
        const m = method ? method.toLowerCase() : 'get';

        const config = {}
        config.headers = {
            'Authorization': `Bearer ${token}`
        };

        if (Axios[m]) {
            let prom = null;

            switch (m) {
                case 'delete': 
                case 'head': 
                case 'options': 
                case 'get': prom =  Axios[m](`${this.host}/${queueId}/${resource}`, params); break;
                
                case 'post':
                case 'put':
                case 'patch': prom =  Axios[m](`${this.host}/${queueId}/${resource}`, params, config); break;

                default: break;
            }
         
            if (prom) {
                return prom.then((e) => {
                    if (e.data && e.status === 200) {
                        return e.data;
                    } else {
                        throw new Error(e.data.Data);
                    }
                });
            }
        }
        
        throw new Error(`method "${m}" not alowed at Axios`);
    }

    async sendError(text) {
        message.error(text.toString());
    }

    async sendSuccess(text) {
        message.success(text.toString());
    }

    async sendWarning(text) {
        message.warning(text.toString());
    }

    async sendInfo(text) {
        message.info(text.toString());
    }

    async conf(operations, wsids, timestamp, offset) {
        //todo
        /*
        {
            "Import": true,
            "Timestamp": 1588242130097,
            "Offset": 1,
            "Operations": [
               {
                  "ID": 25000059049,
                  "Type": "extra_field_values",
                  "ParentID": 0,
                  "ParentType": "",
                  "DocID": 0,
                  "DocType": "",
                  "Data": {
                     "id": 25000059049
                  }
               }
            ]
         }
         */

        console.log('Conf method call:', operations, wsids, timestamp, offset);

        const params = {};

        let location = null;

        if (operations) {
            params['Operations'] = this._checkConfOperations(operations);
        } else {
            throw new Error('Wrong "operations" prop: expected an array of objects, received' + operations);
        }

        if (wsids && _.isArray(wsids) && wsids.length > 0) {
            params['WSIDs'] = wsids;
            location = parseInt(wsids[0]);
        } else {
            throw new Error('Wrong "WSIDs" prop: expected an array of integers, received ', wsids);
        }

        if (timestamp && timestamp > 0) {
            params['Timestamp'] = parseInt(timestamp);
        } else {
            params['Timestamp'] = new Date().valueOf();
        }

        if (_.isNumber(offset) && offset >= 0) {
            params['Offset'] = parseInt(offset);
        } else {
            params['Offset'] = 0; //TODO
        }

        return this.do("airs-bp", `${location}/conf`, params, "post");
    }

    async collection(type, wsids, props) {
        const { 
            entries, 
            page, 
            page_size, 
            show_deleted, 
            required_fields, 
            required_classifiers 
        } = props;

        const params = {};
        let location = null;
        let resultData = null;
        
        console.log('collection method call:', token, type, wsids, entries, page, page_size, show_deleted);

        if (type && typeof type === 'string') {
            params['Type'] = type;
        } else {
            throw new Error('api.collection() call error: wrong "Type" prop: expected a string, received ' + type);
        }

        if (wsids && _.isArray(wsids) && wsids.length > 0) {
            params['WSIDs'] = wsids;
            location = parseInt(wsids[0]);
        } else {
            throw new Error('api.collection() call error: wrong "WSIDs" prop: expected an array of integers, received ', wsids);
        }

        if (page && page >= 0) {
            params['Page'] = page;
        } else {
            params['Page'] = 0;
        }

        if (page_size && page_size > 0) {
            params['PageSize'] = page_size;
        } else {
            params['PageSize'] = null;
        }

        if (required_fields && _.isArray(required_fields) && required_fields.length > 0) {
            params['Fields'] = required_fields;
        }

        if (required_classifiers && _.isArray(required_classifiers) && required_classifiers.length > 0) {
            params['RequiredClassifiers'] = required_classifiers;
        }

        if (entries && _.isArray(entries) && entries.length > 0) {
            params['Entries'] = entries;
        } else {
            params['Entries'] = null;
        }

        if (show_deleted === true) {
            params['ShowDeleted'] = 1;
        } else {
            params['ShowDeleted'] = 0;
        }

        return this.do("airs-bp", `${location}/collection`, params, "post").then((response) => {
            if (response && response["sections"] && _.isArray(response["sections"])) {
                console.log("Response: ", response);
                const builder = new SProtBuilder();
                resultData = builder.build(response["sections"]);
            }

            return resultData;
        }).catch((e) => {
            console.error(e);
        });
    }

    async sync(entries) {
        //todo
        console.log('sync method call:', token, entries);

        return {};
    }

    async log(wsids, props) {
        //todo
        console.log('log method call:', token, props);

        return {};
    }

    // ----- private methods -----
    _checkOperation( operation ) {
        const o = {};
    
        if ( operation && _.isObject(operation)) {
            _.forEach(operationKeys, (key) => {
                if (key in operation) {
                    o[key] = operation[key];
                } else {
                    throw new Error(`missing mandatory field ${key}`);
                }
            });
        } else {
            throw new Error(`operation wrong specified: ${operation}`);
        }
    
        return o;
    };
    
    _checkConfOperations(operations) {
        const ops = [];
    
        if (operations) {
            if (_.isArray(operations)) {
                _.forEach(operations, (operation, i) => {
                    try { 
                        const o =  this._checkOperation(operation);
                        ops.push(o);
                    } catch (e) {
                        throw new Error(`Operation ${i} error: ${e}`);
                    }
                });
            } else {
                throw new Error('Operations must be an array'); // операции должны быть массивом
            }
    
        } else {
            throw new Error('Operations are not specified.'); // операции пустые
        }
    
        return ops;
    };
}

export default MockAlphaApiGate;
