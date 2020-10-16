/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import Axios from 'axios';
import { message } from 'antd';

import { SProtBuilder } from 'airc-shell-core';

const operationKeys = [ 'ID', 'Type', 'ParentID', 'ParentType', /*'PartID', 'PartType',*/ 'DocID', 'DocType', 'Data'];
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjI1NTM2LCJEZXZpY2VJRCI6MSwiZXhwIjoxNTc3NTE5MDQzfQ.dXnbwFUtjcue8_LXNpir3lltj0qoDUarbZ1BDkj5Zno';

class MockAlphaApiGate {
    constructor() {
        this.name = "MockAlphaApiGate";
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

    async collection(type, wsids, props = {}) {
        const { entries, page, page_size, show_deleted, required_fields, required_classifiers } = props;
        //${this.host}/${queueId}/${resource}
        let resultData = {};

        let params = {
            "Page": page,
            "PageSize": page_size,
            "ShowDeleted": show_deleted,
            "Type": type,
            "WSIDs": _.isArray(wsids) ? wsids : [ wsids ],
            "Entries": entries,
            "Fields": required_fields || [],
            "RequiredClassifiers": required_classifiers || [],
            "EmbeddedAsArrays": true
        }

        return this.do("airs-bp", `${_.isArray(wsids) ? wsids[0] : wsids}/collection`, params, "post").then((response) => {
            console.log('+++ api.collection result', response);

            if (response && response["sections"] && _.isArray(response["sections"])) {
                console.log("Response: ", response);
                const builder = new SProtBuilder();
                resultData = builder.build(response["sections"]);
            }

            console.log('+++ resultData', resultData);

            return resultData;
        }).catch((e) => {
            console.error(e);
            throw e;
        });

        /*
        let response = {
            "sections": [],
            "status": 200,
        }
        let resultData = {};

        if (type === "department") {
            console.log('DepartmentData', DepartmentData);
            response = DepartmentData;
        } else if (type === "void_reasons") {
            response["status"] = 501;
            response["errorDescription"] = "Void reasons scheme not implemented yet.";
        }

        //todo
        console.log('collection method call:', type, wsids, entries, page, page_size, show_deleted);

        if (response && response["sections"] && _.isArray(response["sections"])) {
            console.log("Response: ", response);
            const builder = new SProtBuilder();
            resultData = builder.build(response["sections"]);

            console.log("Collections build result: ", resultData);
        }

        */
    }

    async sync(entries) {
        //todo
        console.log('sync method call:', token, entries);

        return {};
    }

    async log(wsids, props) {
        console.log('log call with props: ', wsids, props);
        const { from, to, type, from_offset, to_offset, show } = props;

        const params = {};
        let location = null;

        if (wsids && _.isArray(wsids)) {
            location = parseInt(wsids[0], 10);
            params["WSIDs"] = wsids;
        } else {
            throw new Error('api.log() call error: workspace IDs not specified or wrong given: ' + wsids);
        }

        if (_.isNumber(from) && from >= 0) {
            params['FromDateTime'] = parseInt(from);
        }

        if (_.isNumber(to) && to > 0) {
            params['ToDateTime'] = parseInt(to);
        }

        if (type !== null && type !== undefined && typeof type === 'string') {
            params['Type'] = type;
        }

        if (from_offset) {
            params['FromOffset'] = parseInt(from_offset);
        } else {
            params['FromOffset'] = 0;
        }

        if (to_offset && to_offset > 0) {
            params['ToOffset'] = parseInt(to_offset);
        }

        params['Show'] = !!show;

        const path = `${location}/log`;

        return this.do(`airs-bp`, path, params, 'post').then((res) => {
            let result = {};

            if (res) {
                try {
                    let resBuilder = new SProtBuilder();

                    if (res.sections && _.isArray(res.sections)) {
                        result = resBuilder.build(res.sections);
                    }
                } catch (e) {
                    console.error(e);
                    throw new Error(e);
                }
                
            }

            return result;
        });
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
