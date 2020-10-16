/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Message, Grid, Card } from 'airc-shell-core';
import { withStackEvents } from 'stack-events';

import {
    KEY_ESCAPE,
    KEY_RETURN,
    KEY_LEFT,
    KEY_UP,
    KEY_RIGHT,
    KEY_DOWN,
} from 'keycode-js';

import {
    isValidEntity
} from '../../classes/helpers';

import {
    HeaderBackButton
} from '../common/';

import {
    sendSelectEntityMessage,
    sendCancelMessage,
} from '../../actions/';

class ViewEntityGrid extends Component {
    constructor() {
        super();

        this.state = {
            entities: [],
            selected: null,
            selectedEntity: null
        }

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleBackClick = this.handleBackClick.bind(this);
    }

    componentDidMount() {
        this.setState({
            entities: this.prepareEntities()
        });

        this.props.pushEvents({
            "keydown": this.handleKeyPress
        });
    }

    componentWillUnmount() {
        this.props.popEvents();
    }

    prepareEntities() {
        const { view, contributions } = this.props;
        const viewPoint = contributions.getPointContributions('views', view);

        const entities = viewPoint.managers;

        let declarations = [];

        _.each(entities, (entityName) => {

            const entityManagerPoint = contributions.getPoint('entities', entityName);

            if (entityManagerPoint) {
                declarations.push({
                    "name": entityManagerPoint.getContributuionValue("name"),
                    "code": entityName,
                    "description": entityManagerPoint.getContributuionValue("description"),
                    "ico": entityManagerPoint.getContributuionValue("ico"),
                    "order": entityManagerPoint.getContributuionValue("order")
                });
            }
        });

        if (declarations.length > 0) {
            declarations = _.sortBy(declarations, (o) => o.order);
        }

        return declarations;
    }

    handleBackClick() {
        this.props.sendCancelMessage()
    }

    handleKeyPress(event) {

        const { selected } = this.state;
        const { keyCode } = event;

        switch (keyCode) {
            case KEY_ESCAPE: this.handleBackClick(); break;
            case KEY_RETURN: this.selectEntity(selected); break;
            case KEY_UP: this.moveCursor(-4); break;
            case KEY_DOWN: this.moveCursor(4); break;
            case KEY_RIGHT: this.moveCursor(1); break;
            case KEY_LEFT: this.moveCursor(-1); break;
            default: break;
        }
    }

    moveCursor(offset) {
        const { entities, selected } = this.state;

        if (entities && _.size(entities) > 0) {
            let index = 0;

            if (_.isNumber(selected) && selected >= 0) {
                index += selected + offset;

                if (index < 0) index = 0;
                if (index >= entities.length) index = entities.length - 1;
            }

            this.setState({ selected: index });
        }
    }

    selectEntity(index) {
        const { entities } = this.state;
        
        if (entities && _.size(entities) > 0 && index >= 0) {
            const e = entities[index];

            if (e && isValidEntity({}, e.code)) {
                this.setState({selectedEntity: e.code});
                this.props.sendSelectEntityMessage(e.code);
            }
        }
    }

    renderHeader() {
        const { view, contributions } = this.props;

        let header = contributions.getPointContributionValue('views', view, 'name') || '';

        return (
            <div className="content-header">
                <div className="grid clo-2 row-1">
                    <div className="cell">
                        <HeaderBackButton onClick={this.handleBackClick} />

                        <h1>{header}</h1>
                    </div>
                </div>
            </div>
        );
    }

    renderEntitiesGrid() {
        const { entities, selected, selectedEntity } = this.state;


        return (
            <div className='content-container'>
                {this.renderHeader()}

                <Grid
                    cols={4}
                    gap={24}
                >
                    {
                        entities.map((e, index) => {
                            return (
                                <Card
                                    selected={index === selected}
                                    loading={e.code === selectedEntity}
                                    type='small'
                                    align='center'
                                    valign='center'
                                    title={e.name}
                                    text={e.description}
                                    ico={e.ico}
                                    key={e.name}
                                    onClick={this.selectEntity.bind(this, index)}
                                />
                            );
                        })
                    }
                </Grid>
            </div>
        );
    }

    render() {
        const { entities } = this.state;

        if (entities && entities.length > 0) {
            return this.renderEntitiesGrid(entities);
        }

        return (
            <Message type='error' >
                <p>
                    * TODO Write error text *
                </p>
            </Message>
        );
    }
}

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const { view } = state.plugin;

    return { view, contributions };
};

export default connect(mapStateToProps, {
    sendSelectEntityMessage,
    sendCancelMessage
})(withStackEvents(ViewEntityGrid));
