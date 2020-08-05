/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { IconButton } from '../../base/components';

import {
    ICON_ADD,
    ICON_EDIT,
    ICON_UNIFY,
    ICON_DUPLICATE,
    ICON_DEACTIVATE
} from '../../const/Icons';

import {
    sendNeedEditFormMessage,
    sendNeedCopyFormMessage,
    sendNeedUnifyFormMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
} from '../../actions/';

class EMListRowAction extends Component {
    handleAction(event) {
        event.preventDefault();
        event.stopPropagation();

        const { type, data: rowData } = this.props;

        switch (type) {
            case 'edit': 
                this.props.sendNeedEditFormMessage([rowData.id]); 
                break;

            case 'copy': 
                this.props.sendNeedCopyFormMessage([rowData.id]); 
                break;

            case 'unify': 
                this.props.sendNeedUnifyFormMessage([rowData.id]); 
                break;

            case 'remove': 
                if (rowData.state === 1) {
                    this.props.sendNeedRemoveMessage(rowData.id); 
                } else {
                    this.props.sendNeedReduceMessage(rowData.id); 
                }
                
                break;

            default: break;
        }

        return false;
    }

    getIcon() {
        const { type, data: rowData  } = this.props;

        switch (type) {
            case 'edit': return ICON_EDIT;
            case 'copy': return ICON_DUPLICATE;
            case 'unify': return ICON_UNIFY;
            case 'remove': 
                if (rowData.state === 1) {
                    return ICON_DEACTIVATE;
                } 

                return ICON_ADD;

            default: return null;
        }
    }

    getTitle() {
        const { type, data: rowData } = this.props;

        switch (type) {
            case 'edit': return 'Edit';
            case 'copy': return 'Duplicate';
            case 'unify': return 'Unify';
            case 'remove': 
                if (rowData.state === 1) return 'Remove';
                return 'Restore';
            
            default: return null;
        }
    }

    render() {
        const { type } = this.props;
        const icon = this.getIcon(type);
        
        if (icon) {
            return (
                <IconButton 
                    icon={icon} 
                    title={this.getTitle(type)} 
                    onClick={(event) => this.handleAction(event)} 
                />
            );
        }

        return null;
    }
}

EMListRowAction.propTypes = {
    type: PropTypes.string,
    entity: PropTypes.string,
    data: PropTypes.object,
    rowData: PropTypes.object,
    sendNeedEditFormMessage: PropTypes.func,
    sendNeedCopyFormMessage: PropTypes.func,
    sendNeedUnifyFormMessage: PropTypes.func,
    sendNeedRemoveMessage: PropTypes.func,
    sendNeedReduceMessage: PropTypes.func
};

export default connect(null, {
    sendNeedEditFormMessage,
    sendNeedCopyFormMessage,
    sendNeedUnifyFormMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
})(EMListRowAction);
