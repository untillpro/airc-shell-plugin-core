/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';

import EMEditFormFieldsGroup from './EMEditFormFieldsGroup';

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
        if (this.props.opened === true || nextProps.opened === true) return true;

        return false;
    }

    // TODO use of context
    buildFieldsGroups() {
        if (!this.state.groups) return null;
        
        const { embedded, data, classifiers, changedData, locations, fieldsErrors, onDataChanged, isNew, isCopy  } = this.props;

        let counter = 0;

        return _.map(this.state.groups, (fields, group) => {
            return <EMEditFormFieldsGroup 
                index={counter++}
                key={group}
                locations={locations}
                data={data}
                classifiers={classifiers} // here lies alredy merged data from EMEditForm
                changedData={changedData}
                fieldsErrors={fieldsErrors}
                embedded={embedded}
                onDataChanged={onDataChanged}

                group={group}
                fields={fields}
                
                isNew={isNew}
                isCopy={isCopy}
            />;
        });
    }

    renderFooter() {
        const { footer } = this.props;

        if (footer) {
            if (_.isFunction(footer)) {
                return footer();
            } else if (React.isValidElement(footer)) {
                return footer;
            }
        }

        return null;
    }

    render() {
        const { hasErrors, opened } = this.props;
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

                {this.renderFooter()}
            </div>
        );
    }
}

export default EMEditFormFieldsBuilder;