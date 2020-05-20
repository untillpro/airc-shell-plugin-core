/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ContributionsContext from 'context/ContributionsContext';

import {
    sendCancelMessage
} from 'actions';

import * as EntityManagers from 'contributors/entityManagers';

class EntityRenderer extends Component {
    renderWithContext(context) {
        const { entity } = this.props;
       
        if (entity) {
            const entityManagerPoint = context.getPoint('managers', entity);

            if (entityManagerPoint) {
                const entityManagerClass = entityManagerPoint.getContributuionValue('class');

                if (entityManagerClass && EntityManagers[entityManagerClass]) {
                    return new EntityManagers[entityManagerClass]().render();
                }
            }
        }

        this.props.sendCancelMessage();
    }

    render() {
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
