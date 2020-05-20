/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';

import ContributionsContext from 'context/ContributionsContext';
import { ViewsGrid } from 'components';

class RootRenderer extends Component {
    render() {
        return (
            <ContributionsContext.Consumer>
                { context => <ViewsGrid contributions={context} /> }
            </ContributionsContext.Consumer>
        );
    }
}

export default RootRenderer;
