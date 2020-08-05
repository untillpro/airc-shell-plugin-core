/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Handlebars from 'handlebars';

import DefaultHelpers from '../classes/DefaultHelpers';

import {
    sendError
} from '../../../actions/MessagesActions';

import data from '../../../const/TicketMockData';
import * as Errors from '../../../const/Errors';

class TicketLayoutPreview extends Component {
    constructor() {
        super();
    
        this.state = {
          conten: null
        };

        this.rendered = null;
    }

    componentDidMount() {
        let Helpers = {};
        const { helpers, settings, template } = this.props;

        if (!template || typeof template !== 'string') {
            this.sendError(Errors.TICKET_TEMPLATE_WRONG_GIVEN);
        } else {
            this.initTemplate(template);
        }

        if (helpers && _.size(helpers) > 0) {
            Helpers = { ...Helpers, ...helpers };
        }

        if (DefaultHelpers && _.size(DefaultHelpers) > 0) {
            Helpers = { ...Helpers, ...DefaultHelpers };
        }

        if (_.size(Helpers) > 0) {
            _.each(Helpers, (helper, name) => {
                Handlebars.registerHelper(name, helper)
            });
        }

        if (template)
            this.build(settings);
    }

    componentDidUpdate(oldProps) {
        const { settings, template } = this.props;

        if (template !== oldProps.template) {
            this.initTemplate(template);
            this.build(settings);
        } else if (settings !== oldProps.settings) {
            this.build(settings);
        }
    }

    initTemplate(template) {
        const tpl = this.perfect(template);
        this.rendered = Handlebars.compile(tpl);
    }

    perfect(tpl) {
        let str = tpl;

        const rexp = /<([a-zA-Z]+)((?:\s+[a-zA-Z]+="[\w|-|=|+|_|*|!|@|#|$|%|^|&|.|,|?|/]+")*)\s*\/>/g;

        str = str.replace(rexp, (a, b, c) => {
            return `<${b} ${c ? c : ''}></${b}>`
        });

        str = str.replace('<rimg', '<img');

        return str;
    }

    build(settings) {
        let result = '';

        try {
            result = this.rendered({
                data: data,
                settings
            });

            this.setState({
                content: result
            });
        } catch (e) {
            console.error(e);
            //this.props.sendError('Error while rendering ticket', e.toString)
        }
    }

    render() {
        const { content } = this.state;

        if (!content) return null;

        return (
            <div className="ticket-area" dangerouslySetInnerHTML={{ __html: content }} />
        );
    }
}

export default connect(null, { sendError })(TicketLayoutPreview);