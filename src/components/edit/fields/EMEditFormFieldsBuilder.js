/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';

import EMEditFormFieldsGroup from './EMEditFormFieldsGroup';
import * as Utils from 'classes/Utils';

class EMEditFormFieldsBuilder extends Component {
    constructor() {
        super();

        this.state = {
            groups: null
        };
    }

    componentDidMount() {
        this.initGroups();
    }

    initGroups() {
        const { fields } = this.props;

        const fieldGroups = {
            "default": []
        };

        if (!fields || fields.length <= 0) return null;

        fields.forEach((field) => {
            const f = {...field};

            if (!f.order || !Number(f.order)) f.order = 0;

            if (f.group && typeof f.group === 'string') {
                if (!fieldGroups[f.group]) fieldGroups[f.group] = [];

                fieldGroups[f.group].push(f);
            } else {
                fieldGroups['default'].push(f);
            }
        });

        this.setState({ groups: fieldGroups });
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.opened === true && nextProps.opened !== false) return true;

        return true;
    }

    buildFieldsGroups() {
        if (!this.state.groups) return null;
        
        const { parent, embedded } = this.props;
        const { data, contributions, isNew, isCopy, locations } = parent.props;
        const { fieldsErrors, changedData } = parent.state;

        let mergedData = Utils.mergeDeep({}, data, changedData);
        let counter = 0;

        return _.map(this.state.groups, (fields, group) => {
            return <EMEditFormFieldsGroup 
                index={counter++}
                key={group}
                contributions={contributions}
                isNew={isNew}
                isCopy={isCopy}
                locations={locations}
                data={mergedData}
                changedData={changedData}
                fieldsErrors={fieldsErrors}
                embedded={embedded}
                parent={parent}
                group={group}
                fields={fields}
            />;
        });
    }

    render() {
        const { hasErrors, opened, footer } = this.props;
        const { groups } = this.state;
    
        if (!groups) return null;

        return (
            <div 
                className={`page-section-content  ${hasErrors ? 'has-errors' : ''} 
                ${!opened ? 'hidden' : ''}` } 
            >
                <div className="page-section-content-fields">
                    {opened ? this.buildFieldsGroups() : null}
                </div>

                {footer}
            </div>
        );
    }
}

export default EMEditFormFieldsBuilder;