/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { confirmAlert } from 'react-confirm-alert';

import {
    Button, ConfirmModal, Toggler, Icon
} from '../../base/components/';

import { HeaderBackButton } from '../common';

import {
    sendCancelMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
    sendNeedEditFormMessage,
    sendNeedCopyFormMessage,
    sendNeedUnifyFormMessage
} from '../../actions/';


class EMEditFormHeader extends Component {
    handleNavClick(id) {
        if (id) {
            this.performWithCheckChanges(() => {
                this.props.sendNeedEditFormMessage(id);
                this.componentDidMount();
            });
        };
    }

    handleAction(action) {
        const { id } = this.props;

        switch (action) {
            case 'add':
                this.performWithCheckChanges(() => {
                    this.props.sendNeedEditFormMessage();
                });
                break;

            case 'copy':
                this.performWithCheckChanges(() => {
                    this.props.sendNeedCopyFormMessage(id);
                });
                break;

            case 'unify':  //TODO
                this.props.sendNeedUnifyFormMessage(id);
                break;

            default:
                break;
        }

    }

    handleBackClick() {
        this.performWithCheckChanges(() => this.props.sendCancelMessage());
    }

    handleActiveChange(value) {
        const { parent } = this.props;
        const { changedData } = parent.state; //parent state
        let newData = { ...changedData };

        newData.state = Number(value);

        parent.setState({ changedData: newData });
    }

    performWithCheckChanges(toPerform) {
        const { changedData } = this.props;

        if (_.size(changedData) > 0) {
            this.confirmFormClose(toPerform);
        } else {
            if (toPerform && typeof toPerform === 'function') toPerform();
        }
    }

    _getNewTitle() {
        const { contributions, entity } = this.props;

        //TODO language supports

        const title = contributions.getPointContributionValue('lang', entity, 'new_entity');

        if (title && typeof title === 'string') {
            return title;
        }

        return 'New item';
    }

    _getEditTitle() {
        const { data, contributions, entity } = this.props;

        const title = contributions.getPointContributionValue('lang', entity, 'edit_entity');

        if (title && typeof title === 'string') {
            return `${title} ${data && data.name ? `: ${data.name}` : ''}`;
        }

        return `Editing${data && data.name ? `: ${data.name}` : ''}`;
    }

    _getCopyTitle() {
        const { data, contributions, entity } = this.props;

        const title = contributions.getPointContributionValue('lang', entity, 'copy_entity');

        if (title && typeof title === 'string') {
            return `${title} ${data && data.name ? `: ${data.name}` : ''}`;
        }
        return `Copy${data && data.name ? ` of ${data.name}` : ''}`;
    }

    getFormTitle() {
        const { isNew, isCopy } = this.props;

        if (isCopy) {
            return this._getCopyTitle();
        } else if (isNew) {
            return this._getNewTitle();
        }

        return this._getEditTitle();
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

    renderNavigation() {
        const { id, entityData } = this.props;
        const { prev, next } = entityData ? entityData : {};

        if (id) {
            return (
                <div className="header-navigation">
                    {prev ? (
                        <Button onClick={() => this.handleNavClick(prev)}>
                            <Icon type="double-left" />
                        Previous
                        </Button>
                    ) : null}

                    {next ? (
                        <Button onClick={() => this.handleNavClick(next)}>
                            Next
                            <Icon type="double-right" />
                        </Button>
                    ) : null}
                </div>
            );
        }

        return null;

    }

    renderLocationsSelector() {
        return (<div className="temp-location-selector-style"></div>); //TODO
    }

    renderActiveToggler() {
        const { data, changedData } = this.props;

        let checked = data ? Boolean(data.state) : false;

        if ('state' in changedData) {
            checked = changedData ? Boolean(changedData.state) : false;
        }

        return (
            <Toggler
                label={'Active'}
                right
                onChange={this.handleActiveChange.bind(this)}
                checked={checked}
            />
        )
    }

    renderActions() {
        const { actions } = this.props;

        if (actions && actions.length > 0) {
            return (
                <div className="header-actions">
                    {actions.map((action) => this.renderActionButton(action))}
                </div>
            );
        }

        return null;
    }

    renderActionButton(action) {
        switch (action) {
            case 'add':
                return (
                    <Button
                        icon='plus'
                        key='header-action-add'
                        onClick={() => this.handleAction(action)}
                    />
                );
            case 'copy':
                return (
                    <Button
                        icon='copy'
                        key='header-action-copy'
                        onClick={() => this.handleAction(action)}
                    />
                );

            case 'unify':
                return (
                    <Button
                        icon='block'
                        key='header-action-unify'
                        onClick={() => this.handleAction(action)}
                    />
                );

            default: return null;
        }
    }

    render() {
        const { showActiveToggler, showNavigation, showLocationSelector, actions, contributions } = this.props;

        console.log('Form header contributions: ', contributions);

        return (
            <div className="content-header grid col-3 row-2 gap-8">
                <div className="cell align-left span-2">
                    <div className="edit-form-header">
                        <HeaderBackButton
                            onClick={this.handleBackClick.bind(this)}
                        />

                        <h1>{this.getFormTitle()}</h1>

                        {showActiveToggler ? this.renderActiveToggler() : null}
                    </div>
                </div>

                <div className="cell align-right">
                    {showNavigation ? this.renderNavigation() : null}
                </div>

                <div className="cell span-2">
                    {showLocationSelector ? this.renderLocationsSelector() : null}
                </div>

                <div className="cell align-right">
                    {actions ? this.renderActions() : null}
                </div>
            </div>
        );
    }
}


export default connect(null, {
    sendCancelMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
    sendNeedEditFormMessage,
    sendNeedCopyFormMessage,
    sendNeedUnifyFormMessage
})(EMEditFormHeader);