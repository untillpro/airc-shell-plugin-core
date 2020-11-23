/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Label, FieldError, Tip } from 'airc-shell-core';
import isEqual from 'react-fast-compare';

import {
    TextField,
    MLTextField,
    CheckboxField,
    NumberField,
    RadioField,
    RadioGroupField,
    SelectField,
    ColorPickerField,
    DateField,
    TimeField,
    TipField,
    TicketLayoutField,
    ImageSelectorField,
    EmbeddedManagerField,
    EmbededSelectorField,
    EmbeddedManagerPredefinedField
} from './fields';

class EMEditFormField extends Component {
    constructor() {
        super();

        this.handleChange = this.handleChange.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        const { data, field, errors, embedded_type } = nextProps;
        const { accessor } = field;

        let path = accessor || null ;
        const disabled = field ? field.disabled : null;

        if (disabled && typeof disabled === 'function') {
            return true;
        }

        if (data && path && typeof path === 'string') {
            if (embedded_type) {
                path = `${embedded_type}.${path}`;
            }

            const v1 = _.get(data, path);
            const v2 = _.get(this.props.data, path);

            if (!isEqual(v1,v2)) {
                return true;
            }
        }

        if (!isEqual(errors, this.props.errors)) {
            return true;
        }

        return false;
    }

    handleChange(value, mlValue) {
        const { field, onChange } = this.props;

        if (onChange && typeof onChange === 'function') {
            onChange(field, value, mlValue)
        }
    }

    getValue() {
        const { data, field, embedded_type } = this.props;
        const { accessor } = field;

        let val = '';
        let path = accessor;

        if (data && path && typeof path === 'string') {
            if (embedded_type) {
                path = `${embedded_type}.${path}`;
            }

            val =  _.get(data, path);
        }

        return val;
    }

    render() {
        const { 
            context,
            errors, 
            showError, 
            field, 
            data,
            locations,
            entity,
            classifiers,
            isNew,
            isCopy
        } = this.props;

        let FieldComponent;

        if (!field) return null;

        const hasErrors = errors && errors.length > 0;

        const { type, accessor, label, name, disabled, span, tip, predefined } = field;

        if (accessor && typeof accessor === 'string') {
            switch (type) {
                case 'ml_text': FieldComponent = MLTextField; break;
                case 'number': FieldComponent = NumberField; break;
                case 'radio': FieldComponent = RadioField; break
                case 'radiogroup': FieldComponent = RadioGroupField; break
                case 'select': FieldComponent = SelectField; break;
                case 'color': FieldComponent = ColorPickerField; break;
                case 'checkbox': FieldComponent = CheckboxField; break;
                case 'date': FieldComponent = DateField; break;
                case 'time': FieldComponent = TimeField; break;
                case 'tip': FieldComponent = TipField; break;
                case 'ticket': FieldComponent = TicketLayoutField; break;
                case 'image': FieldComponent = ImageSelectorField; break;
                case 'embedded':   
                    if (predefined) {
                        FieldComponent = EmbeddedManagerPredefinedField; break;
                    } else {
                        FieldComponent = EmbeddedManagerField; break;
                    }
                case 'embedded_selector': FieldComponent = EmbededSelectorField; break;
                
                default: FieldComponent = TextField; break;
            }

            delete field.common; // "common" property causes conflicts in nested components
            
            let fieldValue = this.getValue();

            return (
                <div className={`page-section-field ${span && span > 0 ? `span-${span}` : ''} ${!label ? 'no-label' : ''}`}>
                    {label ? (
                            <Label  
                                error={hasErrors}
                                text={label}
                                tip={tip || null}
                            />
                        ) : null}

                    <div className={`form-row-field ${hasErrors ? 'error' : ''}`}>
                        <FieldComponent 
                            locations={locations}
                            autoFocus 
                            entity={entity}
                            context={context}
                            field={field}
                            disabled={typeof disabled === 'function' ? disabled(field, data) : Boolean(disabled)}
                            showError={showError}
                            errors={errors}
                            onChange={this.handleChange}
                            value={fieldValue}
                            data={data}
                            classifiers={classifiers}

                            isNew={isNew}
                            isCopy={isCopy}
                        />

                        { !label && tip ? <Tip text={tip} /> : null}
                    </div>

                    {hasErrors ? (<FieldError text={errors[0]} />) : null}
                </div>
            );
        }
        
        throw new Error(`Field "${label || name || 'unknown'}" has wrong "accessor" param declared: ${accessor}`, field);
    }
}

const mapStateToProps = (state) => {
    const context = state.context;

    return {
        context
    }
}

export default connect(mapStateToProps, null)(EMEditFormField);