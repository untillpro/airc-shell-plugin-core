/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Toggler, Button } from '../../base/components/';

import ColumnsToggler from './ColumnsToggler';
import { 
    setListShowDeleted,
    sendNeedEditFormMessage,
    sendNeedMassEditFormMessage,
    sendNeedRemoveMessage,
    sendNeedRefreshListDataMessage
} from '../../actions/';

class EMListHeader extends Component {
    handleHeaderAction(action) {
        const { rows } = this.props;

        switch (action) {
            case 'add': 
                this.props.sendNeedEditFormMessage(null); 
                break;
            case 'edit': 
                this.props.sendNeedEditFormMessage(rows); 
                break;
            case 'refresh':
                this.props.sendNeedRefreshListDataMessage(); 
                break;
            case 'massedit': 
                this.props.sendNeedMassEditFormMessage(rows); 
                break;
            case 'remove':
                if (rows && rows.length > 0) {
                    this.props.sendNeedRemoveMessage(rows); 
                }
                    
                break;
            default: break;
        }
    }

    renderHeaderActionButtons() {
        const { component, rows } = this.props;

        if (!component || !component.actions || !component.actions.length) return null;

        const result = {};

        component.actions.forEach((action) => {
            switch (action) {
                case 'add': 
                    result.add = (
                        <Button 
                            icon='plus' 
                            key='header-action-add' 
                            onClick={() => this.handleHeaderAction(action)}
                        /> 
                    );
                    break;
                case 'remove': 
                    result.remove = (
                        <Button 
                            icon='delete' 
                            key='header-action-remove' 
                            disabled={!rows.length}
                            onClick={() => this.handleHeaderAction(action)}
                        /> 
                    );
                    break;

                case 'refresh': 
                    result.refresh = (
                        <Button 
                            icon='reload' 
                            key='header-action-refresh' 
                            onClick={() => this.handleHeaderAction(action)}
                        /> 
                    );
                    break;
                
                case 'edit': 
                    if (!rows || rows.length <= 0) break;
                    result.edit = (
                        <Button 
                            type='primary'
                            key='header-action-edit' 
                            text='Edit item'
                            disabled={rows.length > 1}
                            onClick={() => this.handleHeaderAction(action)}
                        /> 
                    );   
                    break;

                case 'massedit': 
                    if (!rows || rows.length <= 0) break;
                    result.massedit = (
                        <Button 
                            type='primary'
                            key='header-action-massedit' 
                            text='Mass edit'
                            disabled={rows.length <= 1}
                            onClick={() => this.handleHeaderAction(action)}
                        /> 
                    );
                    break;

                default: break;
            }
        });

        return (
            <div className='untill-base-table-header-actions'>
                {Object.values(result)}
            </div>
        );
    }

    renderHeaderTogglers() {
        const { component, showDeleted } = this.props;

        if (!component) return null;
        
        return (
            <div className='untill-base-table-header-togglers'>
                {
                    component.showDeletedToggler ? (
                        <Toggler 
                            label={component.deletedTogglerLabel || 'Show deleted'}
                            right
                            onChange={(val) => {
                                this.props.setListShowDeleted(val);
                            }}
                            checked={showDeleted}
                        />
                    ) : null
                }

                {
                    component.showDeletedToggler ? (
                        <ColumnsToggler 
                            label='Hide columns' 
                        />
                    ) : null
                }
            </div>
        );
    }

    render() {
        return (
            <div className='untill-base-table-header header-actions'>
                {this.renderHeaderTogglers()}
                {this.renderHeaderActionButtons()}
            </div>
        );
    }
}

EMListHeader.propTypes = {
    component: PropTypes.object, 
    rows: PropTypes.array, 
    showDeleted: PropTypes.bool,
    toggleDeletedRowsView: PropTypes.func,
    sendNeedEditFormMessage: PropTypes.func,
    sendNeedRemoveMessage: PropTypes.func,
    sendNeedRefreshListDataMessage: PropTypes.func
};

const mapStateToProps = (state) => {
    const { list } = state.bo;
    const { showDeleted } = list;

    return { showDeleted };
};

export default connect(mapStateToProps, { 
    setListShowDeleted,
    sendNeedEditFormMessage,
    sendNeedMassEditFormMessage,
    sendNeedRemoveMessage,
    sendNeedRefreshListDataMessage
})(EMListHeader);
