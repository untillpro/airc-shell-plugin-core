/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ContributionsContext from '../../context/ContributionsContext';

import ViewEntityGrid from '../common/ViewEntityGrid';

import {
    sendCancelMessage
} from '../../actions/';

class ViewRenderer extends Component {
    renderWithContext(context) {
        const { view } = this.props;

        if (view) {
            const viewPoint = context.getPoint('views', view);

            const type = viewPoint.getContributuionValue('type');

            switch(type) {
                case 'grid': return <ViewEntityGrid view={view} contributions={context} />
                default: throw new Error(`Unsupported type "${view}" of view ${type}`);
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
    const { view } = state.plugin;

    return { view };
};

export default connect(mapStateToProps, { sendCancelMessage })(ViewRenderer);
