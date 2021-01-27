/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import Axios from 'axios';
import { message } from 'antd';

import { SProtBuilder } from 'airc-shell-core';
import TablePlanData from './data/table_plan.json';

const operationKeys = ['ID', 'Type', 'ParentID', 'ParentType', /*'PartID', 'PartType',*/ 'DocID', 'DocType', 'Data'];
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjI1NTM2LCJEZXZpY2VJRCI6MSwiZXhwIjoxNTc3NTE5MDQzfQ.dXnbwFUtjcue8_LXNpir3lltj0qoDUarbZ1BDkj5Zno';

const uploadFileAction = "https://badrequest.ru/tests/uploader/upload.php"; //TODO: mock

class MockAlphaApiGate {
    constructor() {
        this.name = "MockAlphaApiGate";
        this.host = 'https://air-alpha.untill.ru/api';
        //this.host = 'https://air-rc.untill.ru/api';
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
                case 'get': prom = Axios[m](`${this.host}/${queueId}/${resource}`, params); break;

                case 'post':
                case 'put':
                case 'patch': prom = Axios[m](`${this.host}/${queueId}/${resource}`, params, config); break;

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
        console.log('+++ Conf method call:', operations, wsids, timestamp, offset);

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

    //${this.host}/${queueId}/${resource}
    //Mock api call for /collection/ function
    async collection(type, wsids, props = {}) {
        const { entries, page, page_size, show_deleted, required_fields, required_classifiers, filter_by } = props;
        const builder = new SProtBuilder();

        console.log("Api.Collection func call: ", type, wsids, props);

        if (type === 'table_plan') {
            console.log('TablePlanData:', TablePlanData['sections']);
            let mockData = builder.build(TablePlanData['sections']);

            console.log('mockData: ', mockData);
            return mockData
        }

        let resultData = {};

        let params = {
            "Page": page,
            "PageSize": page_size,
            "ShowDeleted": !!show_deleted,
            "Type": type,
            "WSIDs": _.isArray(wsids) ? wsids : [wsids],
            "Entries": entries,
            "Fields": required_fields || [],
            "RequiredClassifiers": required_classifiers || [],
            "EmbeddedAsArrays": true,
            "FilterBy": filter_by || null
        }

        return this.do("airs-bp", `${_.isArray(wsids) ? wsids[0] : wsids}/collection`, params, "post").then((response) => {
            console.log('+++ api.collection result', response);

            if (response && response["sections"] && _.isArray(response["sections"])) {
                resultData = builder.build(response["sections"]);
            }

            console.log('+++ resultData', resultData);

            return resultData;
        }).catch((e) => {
            console.error(e);
            throw e;
        });
    }

    async sync(entries) {
        //todo
        console.log('sync method call:', token, entries);

        return {};
    }

    async log(wsids, props) {
        console.log('log call with props: ', wsids, props);
        const { from, to, type, from_offset, to_offset, show, filterBy, required_classifiers } = props;

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

        if (!_.isNil(type)) {
            if (_.isString(type)) {
                params['Type'] = [type];
            } else if (_.isArray(type)) {
                params['Type'] = type;
            }
        }

        if (from_offset) {
            params['FromOffset'] = parseInt(from_offset);
        } else {
            params['FromOffset'] = 0;
        }

        if (to_offset && to_offset > 0) {
            params['ToOffset'] = parseInt(to_offset);
        }

        if (filterBy) {
            if (_.isPlainObject(filterBy)) {
                params['FilterBy'] = JSON.stringify(filterBy);
            } else if (_.isString(filterBy)) {
                params['FilterBy'] = filterBy;
            }
        }

        if (required_classifiers && _.isArray(required_classifiers)) {
            params['RequiredClassifiers'] = required_classifiers;
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

    async blob(option) {
        // eslint-disable-next-line no-undef
        const xhr = new XMLHttpRequest();

        if (option.onProgress && xhr.upload) {
            xhr.upload.onprogress = function progress(e) {
                if (e.total > 0) {
                    e.percent = (e.loaded / e.total) * 100;
                }
                option.onProgress(e);
            };
        }

        // eslint-disable-next-line no-undef
        const formData = new FormData();

        if (option.data) {
            Object.keys(option.data).forEach(key => {
                const value = option.data[key];
                // support key-value array data
                if (Array.isArray(value)) {
                    value.forEach(item => {
                        // { list: [ 11, 22 ] }
                        // formData.append('list[]', 11);
                        formData.append(`${key}[]`, item);
                    });
                    return;
                }

                formData.append(key, option.data[key]);
            });
        }

        // eslint-disable-next-line no-undef
        if (option.file instanceof Blob) {
            formData.append(option.filename, option.file, option.file.name);
        } else {
            formData.append(option.filename, option.file);
        }

        xhr.onerror = function error(e) {
            option.onError(e);
        };

        xhr.onload = () => {
            // allow success when 2xx status
            // see https://github.com/react-component/upload/issues/34
            if (xhr.status < 200 || xhr.status >= 300) {
                return option.onError(this._getError(option, xhr), this._getBody(xhr));
            }

            return option.onSuccess(this._getBody(xhr), xhr);
        };

        xhr.open(option.method, uploadFileAction, true);

        // Has to be after `.open()`. See https://github.com/enyo/dropzone/issues/179
        if (option.withCredentials && 'withCredentials' in xhr) {
            xhr.withCredentials = true;
        }

        const headers = option.headers || {};

        // when set headers['X-Requested-With'] = null , can close default XHR header
        // see https://github.com/react-component/upload/issues/33
        if (headers['X-Requested-With'] !== null) {
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }

        Object.keys(headers).forEach(h => {
            if (headers[h] !== null) {
                xhr.setRequestHeader(h, headers[h]);
            }
        });

        xhr.send(formData);

        return {
            abort() {
                xhr.abort();
            },
        };
    }

    // ----- private methods -----

    _getError(option, xhr) {
        const msg = `cannot ${option.method} ${option.action} ${xhr.status}'`;
        const err = new Error(msg);

        err.status = xhr.status;
        err.method = option.method;
        err.url = option.action;

        return err;
    }

    _getBody(xhr) {
        const text = xhr.responseText || xhr.response;
        if (!text) {
            return text;
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    }

    _checkOperation(operation) {
        const o = {};

        if (operation && _.isObject(operation)) {
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
                        const o = this._checkOperation(operation);
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
