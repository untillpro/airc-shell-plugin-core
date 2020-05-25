/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import EMEditFormHeader from './EMEditFormHeader';

import EMEditFormFieldsBuilder from './fields/EMEditFormFieldsBuilder';

import {
    Button,
    Sections,
    SectionItem
} from '../../base/components';

import FieldValidator from '../../classes/FieldValidator';

import { sendCancelMessage } from '../../actions/';

import { mergeDeep } from '../../classes/Utils';
import log from '../../classes/Log';

class EMEditForm extends Component {
    constructor() {
        super();

        this.state = {
            changedData: {},
            section: 0,
            sections: [],
            sectionsErrors: {},
            fieldsErrors: {},
            component: {}
        };

        this.doProceed = this.doProceed.bind(this);
        this.doValidate = this.doProceed.bind(this);
    }

    componentDidMount() {
        const { isNew, isCopy, data, entity } = this.props;
        let result = this.prepareProps();

        const sections = this.getSections(entity)

        if (sections && sections.length > 0) {
            result.sections = sections;
        } else {
            console.error(`No available sections declared for '${entity}' entity.`);
            this.props.sendCancelMessage();

            return null;
        }

        if (isCopy) {
            result.changedData = { ...data };
        } else if (isNew) {
            result.changedData = this.setDefaultValues(sections);
        }

        this.setState(result);
    }

    setDefaultValues(sections) {
        const changedData = { state: 1 };

        if (sections && _.isArray(sections)) {
            _.forEach(sections, (section) => {
                if (section && section.fields && _.isArray(section.fields)) {
                    _.forEach(section.fields, (field) => {
                        if (field &&
                            field.accessor &&
                            typeof field.accessor === 'string' &&  
                            field.value !== undefined) {
                                changedData[field.accessor] = field.value;
                        }
                    });
                }
            });
        }

        return changedData;
    }

    doValidate() {
        const { onValidate } = this.props;
        const { changedData } = this.state;

        if (onValidate && typeof onValidate === 'function') {
            if (this.validateFields()) {
                const resultData = { ...changedData };

                onValidate(resultData);
            }
        } else {
            throw new Error(`"onValidate" event not specified`);
        }
    }

    doProceed() {
        const { onProceed } = this.props;


        if (onProceed && typeof onProceed === 'function') {
            if (this.validateFields()) {
                const resultData = this.getProceedData();

                log("%c Result data!!!", "color: red; font-size: 30px;");
                log(resultData);

                onProceed(resultData);
            }
        } else {
            throw new Error(`"onProceed" handler not specified`);
        }

    }

    getProceedData() {
        const { contributions, entity, data } = this.props;
        const { changedData } = this.state;

        const resultData = { ...changedData }

        console.log('resultData before: ', resultData);

        if (resultData && _.isObject(resultData) && _.size(resultData) > 0) {
            _.forEach(resultData, (value, key) => {
                if (key.indexOf("__") === 0) {
                    delete resultData[key];
                }
            });
        }

        console.log('resultData after: ', resultData);

        if (data) {
            const cc = contributions.getPointContributions("forms", entity);

            if (cc) {
                if (cc.embeddedTypes && cc.embeddedTypes.length > 0) {
                    _.each(cc.embeddedTypes, (eType) => {
                        if (data[eType] && data[eType] instanceof Object && resultData[eType]) {
                            resultData[eType].id = data[eType].id;
                        }
                    });
                }
            }
        }

        return resultData;
    }

    validateFields() {
        const { sections, changedData } = this.state;
        const { data } = this.props;

        const resultData = mergeDeep(data || {}, changedData || {});

        const fieldsErrors = {};
        const sectionsErrors = {};

        let validated = true;

        sections.forEach((section, index) => {
            if (section && section.fields && section.fields.length > 0) {
                section.fields.forEach((field) => {
                    const errors = FieldValidator.validate(field, resultData, section.embedded);

                    if (errors && errors.length > 0) {
                        fieldsErrors[field.accessor] = errors;
                        sectionsErrors[index] = true;
                        validated = false;
                    }
                });
            }
        });

        this.setState({
            sectionsErrors,
            fieldsErrors
        });

        return validated;
    }

    prepareProps() {
        const { contributions, entity } = this.props;
        const entityListContributions = contributions.getPointContributions('forms', entity);
        let componentProps = {};

        if (entityListContributions) {
            _.each(entityListContributions, (contribution, type) => {
                switch (type) {
                    case 'component':
                        componentProps = { ...componentProps, ...contribution[0] };
                        break;

                    default:
                        break;
                }
            });
        }

        return {
            component: componentProps,
        };
    }

    getSections(entity, embeded = false) {
        const { contributions } = this.props;
        let sections = [];

        if (contributions && entity) {
            const entityContribution = contributions.getPointContributions('forms', entity);

            if (entityContribution && entityContribution.sections) {
                _.each(entityContribution.sections, (sectionName) => {
                    const conts = contributions.getPointContributions('sections', sectionName);

                    if (conts) {
                        if (embeded) conts.embedded = entity;
                        sections.push(conts);
                    }
                });
            }

            if (entityContribution && entityContribution.embeddedTypes && entityContribution.embeddedTypes.length > 0) {
                _.each(entityContribution.embeddedTypes, (eType) => {
                    const sects = this.getSections(eType, true);

                    if (sects && sects.length > 0) {
                        sections = [...sections, ...sects];
                    }
                });
            }
        }

        return sections;
    }

    handleSectionSelect(index) {
        let i = parseInt(index, 10);

        if (i < 0) {
            i = 0;
        }

        this.setState({ section: i });
    }


    buildSections() {
        const { sections, section, component, sectionsErrors } = this.state;

        if (sections && sections.length > 1) {
            return (
                <div className='page-section-navigation'>
                    <Sections
                        vertical={!component.vertical}
                        data={sections}
                        renderItem={(item, index) => {
                            return <SectionItem
                                error={sectionsErrors ? sectionsErrors[index] : false}
                                key={`tab_${index}`}
                                text={item.name}
                                active={index === section}
                                onClick={() => this.handleSectionSelect(index)}
                            />
                        }}
                    />
                </div>
            );
        }

        return null;
    }

    buildSectionContent() {
        const { sections, section, sectionsErrors, changedData } = this.state;
        const { contributions, entity } = this.props;

        console.log('EMEdifForm - changedData - ', changedData);

        if (sections && sections.length > 0) {
            return sections.map((sec, i) => {
                return (
                    <EMEditFormFieldsBuilder
                        key={`${entity}_section_${i}`}
                        hasErrors={sectionsErrors[section]}
                        fields={sec.fields}
                        contributions={contributions}
                        opened={section === i}
                        parent={this}
                        footer={this.renderButtons()}
                        embedded={sec.embedded}
                    />
                );

            });
        }

        return null;
    }

    buildForm() {
        const { component } = this.state;

        return (
            <div className={`page-section ${component.vertical ? 'vertical' : ''}`}>
                {this.buildSections()}
                {this.buildSectionContent()}
            </div>
        );
    }

    renderButtons() {
        const { hideButtons } = this.props;
        const { allowValidate } = this.state.component;

        if (hideButtons) return null;

        return (
            <div className="page-section-content-buttons">
                {allowValidate === true ? (
                    <Button
                        text="Validate"
                        onClick={this.doValidate}
                    />
                ) : null}

                <Button
                    text="Proceed"
                    type="primary"
                    onClick={this.doProceed}
                />
            </div>
        );
    }

    render() {
        const { changedData, component } = this.state;
        const { data, showHeader, isCopy, isNew, contributions, entity } = this.props;
        const { showActiveToggler, showNavigation, showLocationSelector, actions } = component;

        //log('EMEditForm this.props', this.props);

        return (
            <Fragment>
                {showHeader === true ? (
                    <EMEditFormHeader
                        entity={entity}
                        contributions={contributions}
                        parent={this}
                        showActiveToggler={!!showActiveToggler}
                        showNavigation={!!showNavigation}
                        showLocationSelector={!!showLocationSelector}
                        actions={actions}
                        data={data}
                        isNew={isNew}
                        isCopy={isCopy}
                        changedData={{ ...changedData }}
                    />
                ) : null}

                <div className='paper nopad'>
                    {this.buildForm()}
                </div>
            </Fragment>
        );
    }
}

export default connect(null, { sendCancelMessage })(EMEditForm);
