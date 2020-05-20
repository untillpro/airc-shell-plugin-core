/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { Tabs } from 'antd';

import EMEditFormField from './EMEditFormField';

class EMEditFormFieldsGroup extends Component {
    
    shouldComponentUpdate(nextProps) {
        let oldValues = this.props.changedData;
        let newValues = nextProps.changedData;

        if (this.isFieldsModified(oldValues, newValues)) return true;
        if (this.isFieldshasErrors()) return true;

        return false;
    }

    isFieldsModified(oldValues, newValues) {
        const { fields } = this.props;

        if (!fields || fields.length <= 0) return false;

        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            let oldValue = _.get(oldValues, field.accessor);
            let newValue = _.get(newValues, field.accessor);

            if (oldValue !== newValue) {
                return true;
            }
        }

        return false;
    }

    isFieldshasErrors() {
        const { fields, parent } = this.props;
        const { fieldsErrors } = parent.state;

        if (!fields || fields.length <= 0) return false;

        for (let i = 0; i < fields.length; i++) {
            if (fieldsErrors[fields[i].accessor]) {
                return true;
            }
        }

        return false;
    }

    render() {
        const { parent, embedded, fields, group } = this.props;
        const { data, contributions, isNew, isCopy, locations } = parent.props;
        const { fieldsErrors, changedData } = parent.state;

        let mergedData = _.merge({}, data, changedData);

        const sortedFields = _.sortBy(fields, (o) => o.order);

        const groupHeader = contributions.getPointContributionValue('formsgroups', group, 'name');
        const isTabs = contributions.getPointContributionValue('formsgroups', group, 'tabs');
        const tabsProps = contributions.getPointContributionValue('formsgroups', group, 'tabsProps') || {};

        const content = sortedFields.map((field, index) => {
            if (field && field.accessor) {
                const fieldComponent = <EMEditFormField 
                    errors={fieldsErrors ? fieldsErrors[field.accessor] : null}
                    key={`${field.accessor}_form_field_${index}`}
                    data={mergedData}
                    field={field}
                    parent={parent}
                    isNew={isNew}
                    isCopy={isCopy}
                    locations={locations}
                    showError
                    embedded_type={embedded}
                />;

                if (isTabs) {
                    return (
                        <Tabs.TabPane tab={field.header || 'empty'} key={`${index}`}>
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

                { isTabs ? (
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

export default EMEditFormFieldsGroup;