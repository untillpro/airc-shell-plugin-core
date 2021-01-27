import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class TableArea extends PureComponent {
    constructor(props) {
        super(props);

        this._onImageLoad = this._onImageLoad.bind(this);
    }

    
    _onImageLoad(event) {
        console.log("on image loaded: ", event.target);
        const { naturalWidth: width, naturalHeight: height } = event.target;

        const { onSizeChange } = this.props;

        if (_.isFunction(onSizeChange)) {
            onSizeChange({ width, height });
        }
    }

    renderImage() {
        const { image, width, height } = this.props;

        if (_.isString(image)) {
            return (
                <img 
                    onLoad={this._onImageLoad} 
                    src={image}
                    width={width}
                    height={height}
                    alt="" 
                />
            );
        }

        return null;
    }

    render() {
        const { width, height, onClick } = this.props;

        const styles = {
            width,
            height
        };

        return (
            <div
                className="table-area"
                onClick={onClick}
            >
                <div className="table-area-plan-container">
                    <div className="table-area-plan" style={styles}>
                        {this.renderImage()}
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

export default TableArea;