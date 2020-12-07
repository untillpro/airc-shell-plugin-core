/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs, Logger } from 'airc-shell-core';

import { 
    immutableArrayMerge,
    funcOrString 
} from '../../classes/helpers';

import {
    TYPE_FORMSGROUPS,
    C_FORMSGROUPS_NAME,
    C_FORMSGROUPS_TABS,
    C_FORMSGROUPS_PROPS
} from '../../classes/contributions/Types';

import EMEditFormField from './EMEditFormField';

class EMEditFormFieldsGroup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sortedFields: [],
            groupHeader: null,
            isTabs: false,
            tabsProps: {}
        };

        this.handleFieldChanged = this.handleFieldChanged.bind(this);
    }

    componentDidMount() {
        const {
            fields,
            group,
            contributions,
        } = this.props;

        const sortedFields = _.sortBy(fields, (o) => o.order);

        const header = contributions.getPointContributionValue(TYPE_FORMSGROUPS, group, C_FORMSGROUPS_NAME);
        const isTabs = contributions.getPointContributionValue(TYPE_FORMSGROUPS, group, C_FORMSGROUPS_TABS);
        const tabsProps = contributions.getPointContributionValue(TYPE_FORMSGROUPS, group, C_FORMSGROUPS_PROPS) || {};

        this.setState({
            sortedFields,
            groupHeader: _.isFunction(header) ? header() : header,
            isTabs,
            tabsProps
        });
    }

    componentDidUpdate(olpProps) {
        if (this.props.currentLanguage !== olpProps.currentLanguage) {
            const { contributions, group } = this.props;
            const header = contributions.getPointContributionValue(TYPE_FORMSGROUPS, group, C_FORMSGROUPS_NAME);

            this.setState({
                groupHeader: _.isFunction(header) ? header() : header,
            });
        }
    }

    handleFieldChanged(field, value, mlValue) {
        const { changedData, embedded: embedded_type, onDataChanged, data: Data } = this.props;
        const { accessor, ml_accessor, onChange } = field;

        Logger.log({
            value,
            changedData,
            Data
        }, '++++++++++ handleFieldChanged:')

        let data = {};
        let path = accessor;

        if (embedded_type) {
            value = { [accessor]: value }
            path = `${embedded_type}`;
        }

        if (changedData !== null) data = { ...changedData };

        let v = 0;

        if (value !== 0) {
            v = _.get(data, path);

            if (_.isPlainObject(v)) {
                v = _.merge({ ...v }, value);
            } else if (_.isArray(v)) {
                v = immutableArrayMerge(v, value);
            } else {
                v = value;
            }
        } 

        _.set(data, path, v);

        if (!_.isNil(mlValue) && _.isString(ml_accessor)) {
            _.set(data, ml_accessor, mlValue);
        }

        if (onChange && typeof onChange === 'function') {
            data = { ...data, ...onChange(value, data) };
        }

        if (onDataChanged && typeof onDataChanged === 'function') {
            onDataChanged(data)
        }
    }

    render() {
        const {
            group,
            data,
            classifiers,
            locations,
            fieldsErrors,
            embedded,
            isNew,
            isCopy,
        } = this.props;

        const {
            sortedFields,
            groupHeader,
            isTabs,
            tabsProps
        } = this.state;

        const content = sortedFields.map((field, index) => {
            if (field && field.hidden === true) return null;
            
            if (field && field.accessor) {
                const fieldComponent = <EMEditFormField
                    embedded_type={embedded}
                    errors={fieldsErrors ? fieldsErrors[field.accessor] : null}
                    key={`${field.accessor}_form_field_${index}`}
                    data={data}
                    classifiers={classifiers}
                    field={field}
                    locations={locations}
                    showError
                    onChange={this.handleFieldChanged}

                    isNew={isNew}
                    isCopy={isCopy}
                />;

                if (isTabs) {
                    return (
                        <Tabs.TabPane 
                            key={`${index}`}
                            tab={funcOrString(field.header)} 
                        >
                            {fieldComponent}
                        </Tabs.TabPane>
                    );
                }

                return (
                    fieldComponent
                );
            }

            throw new Error('Error occured while building section content: wrong field decloration', field);
        });


        return (
            <div
                key={`group_${group}`}
                className={`page-section-content-fields-group ${group}`}
            >
                {groupHeader ? (
                    <div className="page-section-content-fields-group-header">
                        {groupHeader}
                    </div>
                ) : null}

                {isTabs ? (
                    <Tabs
                        defaultActiveKey={tabsProps.default ? String(tabsProps.default) : "0"}
                        animated={tabsProps.default || false}
                    >
                        {content}
                    </Tabs>
                ) : (
                        content
                    )}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { currentLanguage } = state.options;
    const { contributions } = state.context;

    return {
        currentLanguage,
        contributions
    };
}

export default connect(mapStateToProps, null)(EMEditFormFieldsGroup);
