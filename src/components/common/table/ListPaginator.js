/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

import ListPaginatorPages from './ListPaginatorPages';
import ListPaginatorSize from './ListPaginatorSize';
import ListPaginatorInfo from './ListPaginatorInfo';

class ListPaginator extends Component {
    renderPages() {
        const { page, pages, onPageChange } = this.props;

        return (
            <div className='-left'>
                <ListPaginatorPages 
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
                <ListPaginatorSize 
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
                <ListPaginatorInfo 
                    page={page}
                    pageSize={pageSize}
                    total={manual ? total : data.length}
                />
            </div>
        );
    }

    render() {
        console.log("ListPaginator props: ", this.props);
        
        return (
            <div className='-pagination'>
                {this.renderPages()}
                {this.renderPageSizeChanger()}
                {this.renderPageTotals()}
            </div>
        );
    }
}

ListPaginator.propTypes = {
    page: PropTypes.number,
    pages: PropTypes.number,
    data: PropTypes.array,
    pageSize: PropTypes.number,
    pageSizeOptions: PropTypes.array,
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func
};

const mapStateToProps = (state) => {
    const { list } = state.plugin;
    const { manual, total } = list;

    return { 
        total,
        manual: manual || false
    }; 
}; 

export default connect(mapStateToProps, null)(ListPaginator);
