/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ContributionsContext from '../../context/ContributionsContext';

import * as Entities from './entities';

import {
    sendCancelMessage
} from '../../actions/';

class EntityRenderer extends Component {
    renderWithContext(context) {
        // TODO different type of entity_edit_step
        const { entity } = this.props;
       
        try {
            if (entity) {
                return <Entities.ListEntity entity={entity} />
            }
        } catch (e) {
            this.props.sendCancelMessage();
        }

        return null;
        /* 
            if (entity) {
                const entityManagerPoint = context.getPoint('managers', entity);

                return 
                if (entityManagerPoint) {
                    const entityManagerClass = entityManagerPoint.getContributuionValue('class');

                    if (entityManagerClass && EntityManagers[entityManagerClass]) {
                        return new EntityManagers[entityManagerClass]().render();
                    }
                }
            }
        */
        
    }

    render() {
        const { entity } = this.props;
       
        console.log(entity);
        return (
            <ContributionsContext.Consumer>
                { context => this.renderWithContext(context) }
            </ContributionsContext.Consumer>
        );
    }
}

EntityRenderer.propTypes = {
    entity: PropTypes.string,
    sendCancelMessage: PropTypes.func
};

const mapStateToProps = (state) => {
    const { entity } = state.bo;

    return { entity };
};

export default connect(mapStateToProps, { sendCancelMessage })(EntityRenderer);
