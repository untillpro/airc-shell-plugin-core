/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import EMList from '../table/EMList';

import {
    sendCancelMessage
} from '../../actions/';

class EntityRenderer extends Component {
    render() {
        // TODO different type of entity_edit_step
        const { entity } = this.props;
       
        try {
            if (entity) {
                return <EMList entity={entity} />;
            }
        } catch (e) {
            this.props.sendCancelMessage();
        }

        return null;
    }
}

const mapStateToProps = (state) => {
    const { entity } = state.plugin;

    return { entity };
};

export default connect(mapStateToProps, { sendCancelMessage })(EntityRenderer);
