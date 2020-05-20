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

import * as Views from 'contributors/applicationViews';

class ViewRenderer extends Component {
    renderWithContext(context) {
        const { view } = this.props;

        if (view) {
            const viewPoint = context.getPoint('views', view);

            if (viewPoint) {
                const viewClass = viewPoint.getContributuionValue('class');
    
                if (viewClass && Views[viewClass]) {
                    return new Views[viewClass]().render();
                }
            }
        }

        this.props.sendCancelMessage();
        
        return null;
    }

    render() {
        return (
            <ContributionsContext.Consumer>
                { context => this.renderWithContext(context) }
            </ContributionsContext.Consumer>
        );
    }
}

ViewRenderer.propTypes = {
    view: PropTypes.string,
    sendCancelMessage: PropTypes.func
};

const mapStateToProps = (state) => {
    const { view } = state.bo;

    return { view };
};

export default connect(mapStateToProps, { sendCancelMessage })(ViewRenderer);
