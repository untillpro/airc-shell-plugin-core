/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import ApiContext from 'context/ApiContext';
import ContributionsContext from 'context/ContributionsContext';

import { Label, FieldError, Tip } from 'base/components'

import {
    TextField,
    CheckboxField,
    NumberField,
    RadioField,
    RadioGroupField,
    SelectField,
    ColorPickerField,
    DateField,
    TipField,
    TicketLayoutField,
    ImageSelectorField,
    EmbeddedManagerField,
    EmbededSelectorField,
    EmbeddedManagerPredefinedField
} from './';


class EMEditFormField extends Component {
    constructor() {
        super();

        this.state = {
            value: null
        };
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

            if (v1 !== v2) {
                return true;
            }
        }

        if (errors !== this.props.errors) {
            return true;
        }

        return false;
    }

    handleChange(value) {
        const { parent, embedded_type } = this.props;
        const { accessor, onChange } = this.props.field;

        let data = {};
        let path = accessor;

        if (embedded_type) {
            value = {
                [accessor]: value
            }

            path = `${embedded_type}`;
        }

        if (parent) {
            const { state } = parent;
            let { changedData } = state;

            if (changedData !== null) data = { ...changedData };

            let v = _.get(data, path);

            if (typeof v === 'object') {
                v = _.merge({ ...v }, value);
            } else {
                v = value;
            }

            _.set(data, path, v);

            if (onChange && typeof onChange === 'function') {
                data = { ...data, ...onChange(value, data)};
            }

            parent.setState({ changedData: data });
        }

        this.setState({ value });
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

    renderField(contributions, api) {
        const { 
            errors, 
            showError, 
            field, 
            data,
            locations,
            entity,
        } = this.props;

        let FieldComponent;

        if (!field) return null;

        const hasErrors = errors && errors.length > 0;

        const { type, accessor, label, name, disabled, span, tip, predefined } = field;
        
        if (accessor && typeof accessor === 'string') {
            switch (type) {
                case 'number': FieldComponent = NumberField; break;
                case 'radio': FieldComponent = RadioField; break
                case 'radiogroup': FieldComponent = RadioGroupField; break
                case 'select': FieldComponent = SelectField; break;
                case 'color': FieldComponent = ColorPickerField; break;
                case 'checkbox': FieldComponent = CheckboxField; break;
                case 'date': FieldComponent = DateField; break;
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
                            api={api}
                            contributions={contributions}
                            field={field}
                            disabled={typeof disabled === 'function' ? disabled(field, data) : Boolean(disabled)}
                            showError={showError}
                            errors={errors}
                            onChange={(value) => this.handleChange(value)}
                            value={this.getValue()}
                            data={data}
                        />

                        { !label && tip ? <Tip text={tip} /> : null}
                    </div>

                    {hasErrors ? (<FieldError text={errors[0]} />) : null}
                </div>
            );
        }
        
        throw new Error(`Field "${label || name || 'unknown'}" has wrong "accessor" param declared: ${accessor}`, field);
    }

    render() {
        const { accessor } = this.props.field;

        if (!accessor || typeof accessor !== 'string') return null;

        return (
            <ContributionsContext.Consumer>
                {(contributions) => (
                    <ApiContext.Consumer>
                        {(api) => this.renderField(contributions, api)}
                    </ApiContext.Consumer>
                )}
            </ContributionsContext.Consumer>
        );
    }
}

export default EMEditFormField;