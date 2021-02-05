import _ from 'lodash';
import isEqual from 'react-fast-compare';

export const simpleMutateCheck = (data, oldData, field, embedded_type) => {
    const { accessor } = field;

    let path = accessor || null ;

    if (embedded_type) {
        path = `${embedded_type}.${path}`;
    }

    const v1 = _.get(data, path);
    const v2 = _.get(oldData, path);

    return !isEqual(v1,v2);
};

export const tablePlanMutateCheck = (newData, oldData, field) => {
    const { accessor, width_accessor, height_accessor, image_accessor } = field;

    let res = false;

    if (_.isString(accessor)) {
        let oldValue = _.get(oldData, accessor);
        let newValue = _.get(newData, accessor);

        res = !isEqual(newValue, oldValue);
    }

    if (!res && _.isString(width_accessor)) {
        let oldValue = _.get(oldData, width_accessor);
        let newValue = _.get(newData, width_accessor);

        res = !isEqual(newValue, oldValue) || res;
    }

    if (!res && _.isString(height_accessor)) {
        let oldValue = _.get(oldData, height_accessor);
        let newValue = _.get(newData, height_accessor);

        res = !isEqual(newValue, oldValue) || res;
    }

    if (!res && _.isString(image_accessor)) {
        let oldValue = _.get(oldData, image_accessor);
        let newValue = _.get(newData, image_accessor);

        res = !isEqual(newValue, oldValue) || res;
    }

    return res;
};
