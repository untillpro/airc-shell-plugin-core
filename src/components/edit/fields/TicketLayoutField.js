/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Message, Select, Button, Empty } from 'airc-shell-core';

import EMEditFormFieldsBuilder from '../EMEditFormFieldsBuilder';
import TicketLayoutPreview from './TicketLayoutPreview';

import {
    sendError
} from '../../../actions/';

import * as Errors from '../../../const/Errors';

const Buffer = require('buffer').Buffer;

class TicketLayoutField extends Component {
    constructor() {
        super();

        this.prefix = 'airc'; // 4 byte blob prefix - indicates that created ticket template is unTill Ait ticket template, not other unTill.

        this.state = {
            error: null,
            changedData: {},

            layouts: [],
            selectedLayout: null,

            layoutSettings: [],
            layoutTemplate: [],
            layoutHelpers: []
        };

        this.onDataChanged = this.onDataChanged.bind(this);
    }

    componentDidMount() {
        const { prefix  } = this.props; 

        if (prefix && typeof prefix === 'string') {
            this.prefix = prefix;
        }

        try {
            this.init();
        } catch (e) {
            this.setState({
                error: e.toString()
            });
        }
    }

    componentDidUpdate() {
        this.handleChange();
    }

    init() {
        const { context, value } = this.props;
        const { contributions } = context;

        let selectedLayout = null;
        let layoutTemplate = null;
        let layoutSettings = null;
        let layoutHelpers = null;
        let changedData = null;
        let templateChanged = false;

        const layouts = {};

        if (!contributions)
            throw new Error('Contributions property not specified');

        const points = contributions.getPoints('layouts');

        if (points.length > 0) {
            _.each(points, (code) => {
                const layoutName = contributions.getPointContributionValue('layouts', code, 'name');

                if (layoutName) {
                    layouts[code] = layoutName;
                }
            });
        }

        if (value) {
            const buffer = new Buffer(value, 'base64');
            
            if (this.checkBlobPrefix(buffer)) {
                const data  = this.parseBlobData(buffer);
            
                if (data.settings && typeof data.settings === 'object') {
                    changedData = data.settings;
                }

                if (data.template && typeof data.code === 'string') {
                    layoutTemplate = data.template;
                }

                if (data.code && typeof data.code === 'string') {
                    selectedLayout = data.code;
                }

                if (selectedLayout && layoutTemplate) {
                    templateChanged = this.compareTemplates(selectedLayout, layoutTemplate);
                }
            }
        }

        if (_.size(layouts) <= 0) {
            throw new Error('No ticket layouts specified!');
        } else {
            if (selectedLayout) {
                layoutHelpers = this.getHelpers(selectedLayout);
                layoutSettings = this.getSettings(selectedLayout);
            }

            this.setState({
                layouts,
                changedData,
                selectedLayout,
                layoutTemplate,
                layoutSettings,
                layoutHelpers,
                templateChanged
            });
        }
    }

    checkBlobPrefix(buffer) {
        if (!buffer) return false;

        const tplPrefix = buffer.slice(0, 4).toString();

        if (tplPrefix !== 'airc') {
            throw new Error('Selected template is not proper unTill Air ticket template');
        }

        return true;
    }

    parseBlobData(buffer) {
        let obj = {};

        if (!buffer) return {};

        const json = buffer.slice(4).toString();

        try {
            obj = JSON.parse(json);
        } catch (e) {
            throw new Error(e);
        }

        return obj;
    }

    compareTemplates(code, template) {
        const { context } = this.props;
        const { contributions } = context;

        const tpl = contributions.getPointContributionValue('layouts', code, 'template');

        if (tpl && template && tpl !== template) {
            return true;
        }

        return false;
    }

    onDataChanged(newChangedData) {
        this.setState({ changedData: newChangedData })
    }

    handleChange() {
        const { changedData, layoutTemplate, selectedLayout } = this.state;
        const { onChange } = this.props;

        if (onChange && typeof onChange === 'function') {
            const result = {
                settings: changedData,
                template: layoutTemplate,
                code: selectedLayout
            };

            const value = 'airc' + JSON.stringify(result);

            const buffer = new Buffer(value);

            onChange(buffer.toString('base64'));
        }
    }

    getTemplate(code) {
        const { context } = this.props;
        const { contributions } = context;

        const template = contributions.getPointContributionValue('layouts', code, 'template');

        return template;
    }

    getSettings(code) {
        const { context } = this.props;
        const { contributions } = context;

        let settings = [];

        const LAYOUT = contributions.getPointContributions('layouts', code);
        settings = LAYOUT.settings || [];

        return settings;
    }

    getHelpers(code) {
        const { context } = this.props;
        const { contributions } = context;

        const helpers = {};
 
        const HELPERS = contributions.getPointContributions('helpers', code);

        if (_.size(HELPERS) > 0) {
            _.each(HELPERS, (arr, name) => helpers[name] = arr[0]);
        }

        return helpers;
    }

    getDefaultValues(settings) {
        const values = {};

        if (_.size(settings) > 0) {
            _.each(settings, (obj) => {
                if (obj.value && obj.accessor) {
                    values[obj.accessor] = obj.value;
                }
            });
        }

        return values;
    }

    selectLayout(code) {
        const { layouts } = this.state;

        let defaultValues = {};

        if (!code) return;

        if (!layouts[code]) this.props.sendError(Errors.WRONG_SELECTED_TICKET_LAYOUT);
        
        const template = this.getTemplate(code);
        const settings = this.getSettings(code);
        const helpers = this.getHelpers(code);

        if (settings && settings.length > 0) {
            defaultValues = this.getDefaultValues(settings)
        }

        if (!template || typeof template !== 'string') {
            this.props.sendError(Errors.TICKET_TEMPLATE_WRONG_GIVEN);
        } else {
            this.setState({
                selectedLayout: code,
                layoutTemplate: template,
                layoutSettings: settings,
                layoutHelpers: helpers,
                changedData: defaultValues
            });
        }
    }

    refreshTemplate() {
        const { selectedLayout: code } = this.state;

        if (!code) return;

        const template = this.getTemplate(code);

        if (template) {
            this.setState({
                layoutTemplate: template,
                templateChanged: false
            });
        }
    }   

    renderChangedMessage() {
        const { templateChanged } = this.state;

        if (!templateChanged) return null;

        return (
            <Message
                type="warning"
                header={'Template has changed'}
                footer={<Button onClick={this.refreshTemplate.bind(this)}>Refresh template</Button>}
            >
                The current version of the template is different from that used in this ticket. Refresh template?
            </Message>
        );
    }

    renderLayoutDetails() {
        const { 
            layoutSettings, 
            layoutTemplate, 
            layoutHelpers,  
            selectedLayout, 
            changedData } = this.state;

        if (!selectedLayout)
            return (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span>Please, select layout</span>}
                />
            );

        return (
            <Fragment>
                {this.renderChangedMessage()}

                <div className="ticket-layout-selector-field-body">
                    <div className="ticket-layout-selector-field-settings">
                        <EMEditFormFieldsBuilder
                            fields={layoutSettings}
                            opened={true}

                            onDataChanged={this.onDataChanged}

                            data={changedData}
                            changedData={changedData}
                        />
                    </div>

                    <div className="ticket-layout-selector-field-preview">
                        <TicketLayoutPreview
                            template={layoutTemplate}
                            settings={{ ...changedData }}
                            helpers={layoutHelpers}
                        />
                    </div>
                </div>
            </Fragment>
        );
    }

    render() {
        const { error, layouts, selectedLayout } = this.state;
        const { disabled, loading } = this.props;
        
        if (error) {
            return (
                <Message type='error'>
                    {error}
                </Message>
            );
        }

        if (layouts.length <= 0) return null;

        return (
            <div className="ticket-layout-selector-field" >
                <Select
                    disabled={disabled}
                    value={selectedLayout}
                    loading={loading}
                    onChange={(code) => this.selectLayout(code)}

                >
                    {_.map(layouts, (text, code) => {
                        return (
                            <Select.Option
                                key={`value_${code}`}
                                value={code}
                            >
                                {text}
                            </Select.Option>
                        )
                    })}
                </Select>

                {this.renderLayoutDetails()}
            </div>
        );
    }
}

export default connect(null, { sendError })(TicketLayoutField);
