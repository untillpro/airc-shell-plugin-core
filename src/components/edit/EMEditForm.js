/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { confirmAlert } from 'react-confirm-alert';
import { withStackEvents } from 'stack-events';

import {
    KEY_RETURN,
    KEY_ESCAPE
} from 'keycode-js';

import EMEditFormHeader from './EMEditFormHeader';
import EMEditFormFieldsBuilder from './EMEditFormFieldsBuilder';

import {
    Button,
    Sections,
    SectionItem,
    ConfirmModal
} from 'airc-shell-core';

import {
    makeValidator,
    mergeDeep
} from '../../classes/helpers';

import {
    sendNeedEditFormMessage,
    sendNeedCopyFormMessage,
    sendCancelMessage,
    sendError
} from '../../actions/';

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
        this.doValidate = this.doValidate.bind(this);

        this.handleDataChanged = this.handleDataChanged.bind(this);
        this.handleStateChanged = this.handleStateChanged.bind(this);
        this.hadleKeyPress = this.hadleKeyPress.bind(this);
        this.handleNavClick = this.handleNavClick.bind(this);
        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleAddAction = this.handleAddAction.bind(this);
        this.handleCopyAction = this.handleCopyAction.bind(this);
        this.handleUnifyAction = this.handleUnifyAction.bind(this);
    }

    componentDidMount() {
        const { isNew, entity } = this.props;
        let result = this.prepareProps();

        const sections = this.getSections(entity)

        if (sections && sections.length > 0) {
            result.sections = sections;
        } else {
            this.props.sendError(`No available sections declared for '${entity}' entity.`);
            this.props.sendCancelMessage();

            return null;
        }

        if (isNew) {
            result.changedData = this.setDefaultValues(sections);
        }

        this.setState(result);

        this.props.pushEvents({
            'keydown': this.hadleKeyPress
        });
    }

    componentWillUnmount() {
        this.props.popEvents();
    }

    hadleKeyPress(event) {
        const { keyCode } = event;

        switch (keyCode) {
            case KEY_RETURN: this.doProceed(); return;
            case KEY_ESCAPE: this.handleBackClick(); return;
            default: return;
        }
    }

    handleNavClick(id) {
        if (id) {
            this.performWithCheckChanges(() => {
                this.props.sendNeedEditFormMessage(id);
            });
        };
    }

    handleBackClick() {
        this.performWithCheckChanges(() => this.props.sendCancelMessage());
    }

    handleAddAction() {
        this.performWithCheckChanges(() => {
            this.props.sendNeedEditFormMessage(null);
        });
    }

    handleCopyAction() {
        const { _entry } = this.props.data;

        if (!_entry || !_.isObject(_entry)) return;

        this.performWithCheckChanges(() => {
            this.props.sendNeedCopyFormMessage([_entry]);
        });
    }

    handleUnifyAction() {
        //TODO
        this.props.sendError('not implemented yet!');
        return;

        //this.props.sendNeedUnifyFormMessage();
    }

    setDefaultValues(sections) {
        const { contributions, entity } = this.props;
        let changedData = { state: 1 };

        const defaultValues = contributions.getPointContributionValue('forms', entity, 'default');

        if (defaultValues && typeof defaultValues === 'object') {
            changedData = { ...changedData, ...defaultValues };
        }

        if (sections && _.isArray(sections)) {
            _.forEach(sections, (section) => {
                if (section && section.fields && _.isArray(section.fields)) {
                    _.forEach(section.fields, (field) => {
                        if (field &&
                            field.accessor &&
                            typeof field.accessor === 'string' &&
                            field.value !== undefined) {

                            if (_.isFunction(field.value)) {
                                changedData[field.accessor] = field.value();
                            } else {
                                changedData[field.accessor] = field.value;
                            }
                        }
                    });
                }
            });
        }

        return changedData;
    }



    performWithCheckChanges(toPerform) {
        const { changedData } = this.props;

        if (_.size(changedData) > 0) {
            this.confirmFormClose(toPerform);
        } else {
            if (toPerform && typeof toPerform === 'function') toPerform();
        }
    }


    confirmFormClose(onConfirm) {
        confirmAlert({
            customUI: ({ onClose }) => <ConfirmModal
                onClose={onClose}
                header="Confirm form close"
                text="Leaving this page will cause all unsaved changes to be lost"
                confirmText="Discard changes and leave"
                onConfirm={() => {
                    if (onConfirm && typeof onConfirm === 'function') {
                        onConfirm();
                    }

                    onClose();
                }}
                rejectText="Return to editing"
                onReject={onClose}
            />
        });
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

                log("%c doProceed: result data: ", "color: red; font-size: 30px;");
                log(resultData);

                onProceed(resultData);
            }
        } else {
            throw new Error(`"onProceed" handler not specified`);
        }

    }

    getProceedData() {
        const { contributions, entity, data, isCopy } = this.props;
        const { changedData } = this.state;

        let resultData = {};

        if (isCopy) {
            resultData = { ...data, ...changedData };
        } else {
            resultData = { ...changedData }
        }

        if (resultData && _.isObject(resultData) && _.size(resultData) > 0) {
            _.forEach(resultData, (value, key) => {
                if (key.indexOf("__") === 0) {
                    delete resultData[key];
                }
            });
        }

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
        const validator = makeValidator();

        let validated = true;
        
        sections.forEach((section, index) => {
            if (section && section.fields && section.fields.length > 0) {
                section.fields.forEach((field) => {
                    const errors = validator.validate(field, resultData, section.embedded);

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

    handleStateChanged(state) {
        const { changedData } = this.state;

        let s = 0;

        if (state === 1) {
            s = 1;
        }

        this.setState({
            changedData: {
                ...changedData,
                state: s,
            }
        });
    }

    handleDataChanged(newChangedData) {
        log("EMEditForm.handleDataChanged() ", newChangedData);
        this.setState({ changedData: newChangedData });
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
        const { sections, section, sectionsErrors, changedData, fieldsErrors } = this.state;
        const { data, classifiers, entity, contributions, isNew, isCopy, locations } = this.props;

        let mergedData = mergeDeep({}, data, changedData);

        log("EMEditForm data", data);
        log("EMEditForm changedData", changedData);
        log("EMEditForm mergedData", mergedData);

        if (sections && sections.length > 0) {
            return sections.map((sec, i) => {
                return (
                    <EMEditFormFieldsBuilder
                        key={`${entity}_section_${i}`}
                        hasErrors={sectionsErrors[section]}
                        fields={sec.fields}
                        contributions={contributions}
                        opened={section === i}
                        footer={() => this.renderButtons()}
                        embedded={sec.embedded}
                        onDataChanged={this.handleDataChanged}

                        locations={locations}
                        data={mergedData}
                        classifiers={classifiers}
                        changedData={changedData}
                        fieldsErrors={fieldsErrors}

                        isNew={isNew}
                        isCopy={isCopy}
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
                        onClick={this.doValidate}
                    >
                        {"Validate"}
                    </Button>
                ) : null}

                <Button
                    type="primary"
                    onClick={this.doProceed}
                >
                    {"Proceed"}
                </Button>
            </div>
        );
    }

    render() {
        const { changedData, component } = this.state;
        const { data, showHeader, isCopy, isNew, entity } = this.props;
        const { showActiveToggler, showNavigation, showLocationSelector, actions } = component;

        //log('EMEditForm this.props', this.props);

        return (
            <Fragment>
                {showHeader === true ? (
                    <EMEditFormHeader
                        entity={entity}
                        onStateChanged={this.handleStateChanged}
                        showActiveToggler={!!showActiveToggler}
                        showNavigation={!!showNavigation}
                        showLocationSelector={!!showLocationSelector}
                        actions={actions}
                        data={data}
                        isNew={isNew}
                        isCopy={isCopy}
                        changedData={changedData}
                        onBackClick={this.handleBackClick}
                        onPrevClick={this.handleNavClick}
                        onNextClick={this.handleNavClick}
                        onAdd={this.handleAddAction}
                        onCopy={this.handleCopyAction}
                        onUnify={this.handleAddAction}
                    />
                ) : null}

                <div className='paper nopad'>
                    {this.buildForm()}
                </div>
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { contributions } = state.context;

    return { contributions };
}

const mapDispatchToProps = {
    sendNeedEditFormMessage,
    sendNeedCopyFormMessage,
    sendCancelMessage,
    sendError
}
export default connect(mapStateToProps, mapDispatchToProps)(withStackEvents(EMEditForm));
