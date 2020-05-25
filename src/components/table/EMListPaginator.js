/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

import EMListPaginatorPages from './EMListPaginatorPages';
import EMListPaginatorSize from './EMListPaginatorSize';
import EMListPaginatorInfo from './EMListPaginatorInfo';

class EMListPaginator extends Component {
    renderPages() {
        const { page, pages, onPageChange } = this.props;

        return (
            <div className='-left'>
                <EMListPaginatorPages 
                    page={page} 
                    pages={pages} 
                    range={2} 
                    selectPage={onPageChange} 
                />
            </div>
        );
    }

    renderPageSizeChanger() {
        const { pageSizeOptions, pageSize, onPageSizeChange } = this.props;

        return (
            <div className='-center'>
                <EMListPaginatorSize 
                    options={pageSizeOptions}
                    size={pageSize}
                    onChange={onPageSizeChange}
                />
            </div>
        );
    }

    renderPageTotals() {
        const { page, pageSize, data, manual, total } = this.props;
        
        return (
            <div className='-right'>
                <EMListPaginatorInfo 
                    page={page}
                    pageSize={pageSize}
                    total={manual ? total : data.length}
                />
            </div>
        );
    }

    render() {
        return (
            <div className='-pagination'>
                {this.renderPages()}
                {this.renderPageSizeChanger()}
                {this.renderPageTotals()}
            </div>
        );
    }
}

EMListPaginator.propTypes = {
    page: PropTypes.number,
    pages: PropTypes.number,
    data: PropTypes.array,
    pageSize: PropTypes.number,
    pageSizeOptions: PropTypes.array,
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func
};

const mapStateToProps = (state) => {
    const { list } = state.bo;
    const { manual, total } = list;

    return { 
        total,
        manual: manual || false
    }; 
}; 

export default connect(mapStateToProps, null)(EMListPaginator);
