/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Label, FieldError, Tip } from 'airc-shell-core';
import isEqual from 'react-fast-compare';

import {
    simpleMutateCheck,
    tablePlanMutateCheck,
    mlTextMutateCheck,
} from './classes/Utils';

import {
    funcOrString
} from '../../classes/helpers';

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
    ImageSetSelector,
    EmbeddedManagerField,
    EmbededSelectorField,
    EmbeddedManagerPredefinedField,
    TablePlanEditor
} from './fields';

class EMEditFormField extends Component {
    constructor() {
        super();

        this.handleChange = this.handleChange.bind(this);
        this.changeFieldValue = this.changeFieldValue.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        const { field, errors, embedded_type } = nextProps;
        const { type, disabled } = field;

        if (_.isFunction(disabled)) {
            return true;
        }

        if (!isEqual(errors, this.props.errors)) {
            return true;
        }

        switch (type) {
            case 'table_plan_editor': return tablePlanMutateCheck(nextProps.data, this.props.data, field, embedded_type);
            case 'ml_text': return mlTextMutateCheck(nextProps.data, this.props.data, field, embedded_type);
            default: return simpleMutateCheck(nextProps.data, this.props.data, field, embedded_type)
        }
    }

    handleChange(value) {
        const { field, onChange } = this.props;

        if (onChange && typeof onChange === 'function') {
            onChange(field, value)
        }
    }

    changeFieldValue(value, field) {
        const { onChange } = this.props;

        if (onChange && typeof onChange === 'function') {
            onChange(field, value)
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

        const { type, accessor, label, disabled, span, tip, predefined } = field;

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
                case 'image_set': FieldComponent = ImageSetSelector; break;
                case 'table_plan_editor': FieldComponent = TablePlanEditor; break;
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
                                text={funcOrString(field.label)}
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
                            changeFieldValue={this.changeFieldValue}
                            value={fieldValue}
                            data={data}
                            classifiers={classifiers}

                            isNew={isNew}
                            isCopy={isCopy}
                        />

                        { !label && tip ? <Tip text={funcOrString(field.tip)} /> : null}
                    </div>

                    {hasErrors ? (<FieldError text={errors[0]} />) : null}
                </div>
            );
        }
        
        throw new Error(`Field has wrong "accessor" param declared: ${accessor}`, field);
    }
}

const mapStateToProps = (state) => {
    const context = state.context;

    return {
        context
    }
}

export default connect(mapStateToProps, null)(EMEditFormField);