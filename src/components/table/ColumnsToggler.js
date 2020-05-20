/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Toggler } from 'base/components'; 

import { setColumnsVisibility } from 'actions';

import { Button, Popover } from 'base/components';
import { Empty, Icon } from 'antd';

class ColumnsToggler extends Component {
    constructor(props) {
        super(props);

        this.state = {
            opened: false
        };
    }

    handleChange(checked, header) {
        const { visibility } = this.props;

        if (visibility) {
            const visibilityTemp = { ...visibility };

            visibilityTemp[header] = checked;

            this.props.setColumnsVisibility(visibilityTemp);
        }
    }

    handleClick() {
        this.setState({ opened: !this.state.opened });
    }

    renderColumnList() {
        const { visibility } = this.props;

        if (visibility) {
            return (
                <ul>
                    {
                        _.map(visibility, (value, header) => {
                            return (
                                <li key={`${header}_key`}>
                                    <Toggler 
                                        id={`${header}_column`}
                                        label={header}
                                        checked={value}
                                        onChange={(value) => this.handleChange(value, header)}
                                    />
                                </li>
                            );
                        })
                    }
                </ul>
            );
        } else {
            return <Empty />;
        }
    }

    isColumnsHidden() {
        const { visibility } = this.props;

        let isHidden = false;

        if (visibility) {
            _.each(visibility, (val) => {
                if (val === false) {
                    isHidden = true;
                    return false;
                }
            })
        }

        return isHidden;
    }

    render() {
        const { label } = this.props;

        const content = this.renderColumnList();
        const isColumnsHidden = this.isColumnsHidden();

        return (
            <div className='bo-table-columns-toggler' >
                <Popover placement="bottom" content={content} trigger="click">
                    <Button 
                        type="link"
                        style={isColumnsHidden ? {} : {color: "#000"}}
                    >
                        
                        <Icon type={isColumnsHidden ? "eye" : "eye-invisible"} />
                        {label}
                    </Button>
                </Popover>
            </div>
        );
    }
}

ColumnsToggler.propTypes = {
    label: PropTypes.string,
    visibility: PropTypes.object,
    setColumnsVisibility: PropTypes.func
};

const mapStateToProps = (state) => {
    const { columnsVisibility } = state.bo;
    
    return { 
        visibility: columnsVisibility || {}
    };
};

export default connect(mapStateToProps, { setColumnsVisibility })(ColumnsToggler);
