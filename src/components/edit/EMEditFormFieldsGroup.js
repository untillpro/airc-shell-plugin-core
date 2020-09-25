/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';

import EMEditFormField from './EMEditFormField';

import Logger from '../../base/classes/Logger';

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

        const groupHeader = contributions.getPointContributionValue('formsgroups', group, 'name');
        const isTabs = contributions.getPointContributionValue('formsgroups', group, 'tabs');
        const tabsProps = contributions.getPointContributionValue('formsgroups', group, 'tabsProps') || {};

        this.setState({
            sortedFields,
            groupHeader,
            isTabs,
            tabsProps
        });
    }

    handleFieldChanged(field, value) {
        const { changedData, embedded: embedded_type, onDataChanged, data: Data } = this.props;
        const { accessor, onChange } = field;

        console.log('++++++++++ handleFieldChanged: ');
        console.log("value: ", value);
        console.log("changedData: ", changedData);
        console.log("data: ", Data);

        let data = {};
        let path = accessor;

        Logger.log("EMEditFormFieldsGroup.handleFieldChanged() ", field, value);

        if (embedded_type) {
            value = { [accessor]: value }
            path = `${embedded_type}`;
        }

        if (changedData !== null) data = { ...changedData };

        let v = _.get(data, path);

        if (_.isPlainObject(v)) {
            v = _.merge({ ...v }, value);
        } else if (_.isArray(v)) {
            v = _.merge(v, value);
        } else {
            v = value;
        }

        _.set(data, path, v);

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
            locations,
            fieldsErrors,
            embedded
        } = this.props;

        const {
            sortedFields,
            groupHeader,
            isTabs,
            tabsProps
        } = this.state;

        const content = sortedFields.map((field, index) => {
            if (field && field.accessor) {
                const fieldComponent = <EMEditFormField
                    embedded_type={embedded}
                    errors={fieldsErrors ? fieldsErrors[field.accessor] : null}
                    key={`${field.accessor}_form_field_${index}`}
                    data={data}
                    field={field}
                    locations={locations}
                    showError
                    onChange={this.handleFieldChanged}
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
    const { contributions } = state.context;

    return {
        contributions
    };
}

export default connect(mapStateToProps, null)(EMEditFormFieldsGroup);
