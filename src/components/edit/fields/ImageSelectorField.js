/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component, Fragment } from 'react';
import i18next from 'i18next';
import { connect } from 'react-redux';
import { ImageSelector, Tip } from 'airc-shell-core';

import {
    sendError
} from '../../../actions/MessagesActions';

import { getFileSize } from '../../../classes/helpers';

class NumberField extends Component {
    handleChange(value = null) {
        const { onChange } = this.props;

        if (onChange && typeof onChange === 'function' ) {
            onChange(value);
        }
    }

    renderTip() {
        const { maxImageSize } = this.props;

        if (maxImageSize && typeof maxImageSize === 'number' && maxImageSize > 0) {
            const size = getFileSize(maxImageSize);
            
            return <Tip text={i18next.t("form.max_image_size", {size: size.formated})} />
        }
    }

    render() {
        const { value, field, disabled, maxImageSize } = this.props;

        if (!field) return null;

        return (
            <Fragment>
                <ImageSelector 
                    disabled={disabled}
                    value={value}
                    maxImageSize={maxImageSize}
                    onChange={(event) => this.handleChange(event)}  
                    onError={(error) => {
                        this.props.sendError(error)
                    }}
                />

                {this.renderTip()}
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { maxUploadImageSize } = state.options;

    return {
        maxImageSize: maxUploadImageSize
    }
};

export default connect(mapStateToProps, {sendError})(NumberField);