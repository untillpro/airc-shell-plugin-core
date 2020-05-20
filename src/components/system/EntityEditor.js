/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { 
    EMEditForm,
    EMMassEditForm
} from 'components';

import {
    sendNeedProccessMessage,
    sendNeedValidateMessage,
    sendNeedFormNavigation
} from 'actions';

class EntityEditor extends Component {
    componentDidMount() {
        const { id } = this.props;

        if (id) {
            this.props.sendNeedFormNavigation(id);
        }
    }

   componentDidUpdate(nextProps) {
        const { id } = this.props;

        if (id !== nextProps.id) {
            this.props.sendNeedFormNavigation(nextProps.id);
        }
    }

    render() {
        const { contributions, massedit, data, locations, entity, isCopy, isNew } = this.props;

        return (
            <div className='content-container'>
                {massedit ? (
                    <EMMassEditForm 
                        showHeader 
                        contributions={contributions}
                        data={data}
                        entity={entity}

                        onValidate={() => this.props.sendNeedValidateMessage(data)}
                        onProceed={(data) => this.props.sendNeedProccessMessage(data)}
                    />
                ) : (
                    <EMEditForm 
                        showHeader 
                        contributions={contributions}
                        data={data}
                        entity={entity}
                        isCopy={isCopy}
                        isNew={isNew}

                        locations={locations}

                        onValidate={() => this.props.sendNeedValidateMessage(data)}
                        onProceed={(data) => this.props.sendNeedProccessMessage(data)}
                    />
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { entity, entityData, isCopy, isNew, locations } = state.bo;

    return { 
        isCopy,
        isNew,
        locations,
        entity, 
        entityData,
        id: entityData ? entityData.id : null,
        data: entityData ? entityData.data : []
    };
};

export default connect(mapStateToProps, {
    sendNeedProccessMessage,
    sendNeedValidateMessage,
    sendNeedFormNavigation
})(EntityEditor);
