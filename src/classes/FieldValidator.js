/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import * as Errors from '../lang/Errors';

class FieldValidator {
    validate(field, data, embedded_type) {
        const errors = [];

        if (!field) return false;

        const { accessor,  min, max, maxLength, minLength, regexp, required, type } = field

        let path = accessor;

        if (embedded_type) {
            path = `${embedded_type}.${path}`;
        }

        if (path) {
            const value = _.get(data, path);

            const req = typeof required === 'function' ? required(field, data) : !! required;

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
            errors.push(Errors.CURRENT_VALUE_NOT_NUMBER_ERROR);
        } else if (curVal < minVal) {
            errors.push(Errors.MIN_VALUE_ERROR.replace("#VALUE#", minVal));
        }
    }

    validateMaxValue(value, max, errors) {
        const maxVal = Number(max);
        const curVal = Number(value);

        if (!curVal) {
            errors.push(Errors.CURRENT_VALUE_NOT_NUMBER_ERROR);
        } else if (curVal > maxVal) {
            errors.push(Errors.MAX_VALUE_ERROR.replace("#VALUE#", maxVal));
        }
    }

    validateMinLengthValue(minLength, value, errors) {
        const minVal = Number(minLength);
        const curValue = String(value);

        if (curValue.length < minVal) {
            errors.push(Errors.MIN_LENGTH_ERROR.replace("#VALUE#", minVal));
        }
    }   

    validateMaxLengthValue(maxLength, value, errors) {
        const maxVal = Number(maxLength);
        const curValue = String(value);

        if (curValue.length > maxVal) {
            errors.push(Errors.MAX_LENGTH_ERROR.replace("#VALUE#", maxVal));
        }
    }

    validateNumber(value, errors) {
        const curVal = Number(value);
        if (!curVal) {
            errors.push(Errors.NUMBER_VALUE_ERROR);
        }
    }

    validateEmail(value, errors) {
        const curVal = String(value);
        var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
        if (!re.test(curVal)) {
            errors.push(Errors.CURRENT_VALUE_NOT_EMAIL_ERROR);
        }
    }

    validateRegexp(value, regexp, errors) {
        const re = new RegExp(regexp);
        const curVal = String(value);

        if (!re) {
            errors.push(Errors.WRONG_REGEXP_ERROR)
        } else if (!re.test(curVal)) {
            errors.push(Errors.NOT_VALID_VALUE_ERROR)
        }

    }

    validateRequired(value, errors) {
        if (!value && value !== 0 && value !== false) {
            errors.push(Errors.REQUIRED_VALUE_ERROR);
        }
    }
}

export default new FieldValidator();