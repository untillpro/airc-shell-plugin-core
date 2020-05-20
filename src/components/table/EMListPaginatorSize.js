/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class EMListPaginatorSize extends Component {
    handleChange(event) {
        const { onChange } = this.props;

        if (onChange && typeof onChange === 'function') {
            const size = parseInt(event.target.value, 10);
            
            onChange(size);
        }
    }

    render() {  
        const { options, size } = this.props;

        if (options && options.length > 1) {
            return (
                <div className='-pageSize'>
                    View

                    <select 
                        onChange={(event) => this.handleChange(event)} 
                        defaultValue={size}
                    >
                        {
                            options.map((option) => {
                                return (
                                    <option 
                                        key={`size_${option}`}
                                        value={option}
                                    >{option}</option>
                                );
                            })
                        }

                    </select>

                    items per page
                </div>
            );
        }
        
        return null;
    }
}

EMListPaginatorSize.propTypes = {
    options: PropTypes.array,
    size: PropTypes.number,
    onChange: PropTypes.func
};

export default EMListPaginatorSize;
