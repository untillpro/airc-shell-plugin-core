/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { EMList } from '../../table/';

import ApiContext from '../../../context/ApiContext';
import ContributionsContext from '../../../context/ContributionsContext';


class ListEntity extends Component {
    render() {
        const { entity } = this.props;
        
        return (
            <ContributionsContext.Consumer>
                {
                    (contributions) => (
                        <ApiContext.Consumer>
                            {
                                (api) => (
                                    <EMList 
                                        entity={entity}
                                        contributions={contributions} 
                                        api={api} 
                                    />
                                ) 
                            }
                        </ApiContext.Consumer>
                    )
                }
            </ContributionsContext.Consumer>
        );
    }
}

export default ListEntity;
