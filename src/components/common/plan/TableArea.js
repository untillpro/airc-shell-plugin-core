import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { getBlobPath } from 'airc-shell-core';

class TableArea extends PureComponent {
    constructor(props) {
        super(props);
        
        this._onImageLoad = this._onImageLoad.bind(this);
    }


    _onImageLoad(event) {
        if (_.isNumber(this.props.width) && 
            _.isNumber(this.props.height) && 
            this.props.width > 0 && this.props.height > 0
        ) {
            return;
        }

        const { naturalWidth: width, naturalHeight: height } = event.target;

        const { onSizeChange } = this.props;

        if (_.isFunction(onSizeChange)) {
            onSizeChange({ width, height });
        }
    }

    setImage(styles) {
        const { image, width, height } = this.props;

        let url = null;

        if (_.isString(image)) {
            url = image;
        } else if (_.isNumber(image)) {
            url = getBlobPath(image);
        }

        if (url) {
            styles.backgroundImage = `url(${url})`;
        }
    }

    render() {
        const { width, height, onClick } = this.props;

        let styles = {
            width,
            height
        };

        this.setImage(styles)

        return (
            <div
                className="table-area"
                onClick={onClick}
            >
                <div className="table-area-plan-container">
                    <div className="cc">
                        <div className="table-area-plan" style={styles}>
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

TableArea.propTypes = {
    children: PropTypes.node,
    width: PropTypes.number,
    height: PropTypes.number,
    image: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
};

export default TableArea;