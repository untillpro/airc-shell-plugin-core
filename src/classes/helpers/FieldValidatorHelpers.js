/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import i18next from 'i18next';

class FieldValidator {
    validate(field, data, embedded_type) {
        const errors = [];

        if (!field) return false;

        const { accessor, min, max, maxLength, minLength, regexp, required, type } = field

        let path = accessor;

        if (embedded_type) {
            path = `${embedded_type}.${path}`;
        }

        if (path) {
            let value = _.get(data, path);

            const req = typeof required === 'function' ? required(field, data) : !!required;

            if (value && (!type || type === 'text' || type === 'string')) {
                value = String(value).trim();
            }

            if (req) this.validateRequired(value, errors);

            if (value) {
                if (type === 'number') this.validateNumber(value, errors);
                if (type === 'email') this.validateEmail(value, errors);
                if (!isNaN(Number(min))) this.validateMinValue(value, min, errors);
                if (!isNaN(Number(max))) this.validateMaxValue(value, max, errors);
                if (Number(minLength) >= 0) this.validateMinLengthValue(minLength, value, errors);
                if (Number(maxLength) >= 1) this.validateMaxLengthValue(maxLength, value, errors);
                if (regexp) this.validateRegexp(value, regexp, errors);
            }
        }

        return errors;
    }

    validateMinValue(value, min, errors) {
        const minVal = Number(min);
        const curVal = Number(value);

        if (!curVal) {
            errors.push(i18next.t("errors.current_value_not_number_error"));
        } else if (curVal < minVal) {
            errors.push(i18next.t("errors.min_value_error", { value: minVal}));
        }
    }

    validateMaxValue(value, max, errors) {
        const maxVal = Number(max);
        const curVal = Number(value);

        if (!curVal) {
            errors.push(i18next.t("errors.current_value_not_number_error"));
        } else if (curVal > maxVal) {
            errors.push(i18next.t("errors.max_value_error", { value: maxVal}));
        }
    }

    validateMinLengthValue(minLength, value, errors) {
        const minVal = Number(minLength);
        const curValue = String(value);

        if (curValue.length < minVal) {
            errors.push(i18next.t("errors.min_length_error", {value: minVal}));
        }
    }

    validateMaxLengthValue(maxLength, value, errors) {
        const maxVal = Number(maxLength);
        const curValue = String(value);

        if (curValue.length > maxVal) {
            errors.push(i18next.t("errors.max_length_error", {value: maxVal}));
        }
    }

    validateNumber(value, errors) {
        const curVal = Number(value);
        if (!curVal) {
            errors.push(i18next.t("errors.number_value_error"));
        }
    }

    validateEmail(value, errors) {
        const curVal = String(value);
        var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!re.test(curVal)) {
            errors.push(i18next.t("errors.current_value_not_email_error"));
        }
    }

    validateRegexp(value, regexp, errors) {
        const re = new RegExp(regexp);
        const curVal = String(value);

        if (!re) {//
            errors.push(i18next.t("errors.wrong_regexp_error"));
        } else if (!re.test(curVal)) {
            errors.push(i18next.t("errors.not_valid_value_error"))
        }
    }

    validateRequired(value, errors) {
        if (_.isNil(value) || value === "") {
            errors.push(i18next.t("errors.required_value_error"));
        }
    }
}

export const makeValidator = () => {
    const validator = new FieldValidator();

    return function () {
        return validator;
    }();
};