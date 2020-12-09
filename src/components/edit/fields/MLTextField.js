/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { TextInput, Button, Modal, translate as t } from 'airc-shell-core';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';

import { SelectLanguageForm } from "../../common";

import { bufferToLangMap, langMapToBuffer } from '../../../classes/helpers';

import { LANGUAGES } from '../../../const';

import { addAvailableLanguage } from '../../../actions';

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

class MLTextField extends Component {
    constructor(props) {
        super(props);

        this.state = {
            opened: false,
            value: null,
            newLang: false,
            ml: {},
            mlTemp: {},
        };

        this.handleAddonPress = this.handleAddonPress.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleMLFormConfirm = this.handleMLFormConfirm.bind(this);
        this.handleAddLanguage = this.handleAddLanguage.bind(this);
        this.langFormOnChange = this.langFormOnChange.bind(this);
        this.langFormOnCancel = this.langFormOnCancel.bind(this);
    }

    componentDidMount() {
        const { data, field, isNew, value, lang, defaultLang } = this.props;
        const { ml_accessor } = field;

        let langMap = {};

        if (isNew && value) {
            langMap[lang] = value;
            langMap[defaultLang] = value;
        } else if (ml_accessor && (_.isString(ml_accessor) || _.isFunction(ml_accessor))) {
            let ml_base64Str

            if (_.isString(ml_accessor)) {
                ml_base64Str = _.get(data, ml_accessor);
            } else if (_.isFunction(ml_accessor)) {
                ml_base64Str = ml_accessor(data);
            }

            if (ml_base64Str) {
                langMap = bufferToLangMap(ml_base64Str);
            }
        }

        this.setState({
            ml: langMap,
            value
        });
    }

    getComponentProps() {
        const { field } = this.props;
        
        let props = {};

        if (!field) return props;

        const {
            allowClear,
            addonBefore,
            prefix,
            size,
            suffix,
            maxLength,
            autofocus
        } = field;

        props.allowClear = !!allowClear;
        if (maxLength && maxLength >= 1) props.maxLength = parseInt(maxLength);
        if (addonBefore) props.addonBefore = addonBefore;
        if (prefix) props.prefix = prefix;
        if (suffix) props.suffix = suffix;
        if (size) props.size = ['small', 'default', 'large'].indexOf(size) >= 0 ? size : 'default';
        if (autofocus) props.autoFocus = true;

        return props;
    }

    handleChange(value, ml, opt = {}) {
        const { onChange } = this.props;

        if (_.isFunction(onChange)) {
            let buf = langMapToBuffer(ml || {});
            onChange(value ? String(value) : '', buf);
        }

        this.setState({ ...opt, value, ml });
    }

    handleAddonPress() {
        const { ml } = this.state;

        this.setState({ opened: true, ml_temp: ml });
    }

    handleModalClose() {
        this.setState({ opened: false, ml_temp: {} });
    }

    handleInputChange(event) {
        const { lang, defaultLang, isNew } = this.props;
        const { ml } = this.state;

        const { value } = event.target;

        const mlNew = { ...ml };

        mlNew[lang] = value;

        if (isNew === true) {
            mlNew[defaultLang] = value;
        }

        this.handleChange(value, mlNew);
    }

    handleMLFormConfirm(formValues) {
        const { value } = this.state;

        if (_.isPlainObject(formValues) && _.size(formValues) > 0) {
            let values = {}

            _.forEach(formValues, (v, k) => values[k] = v || "");

            this.handleChange(value, values, { opened: false });
        }
    }

    handleAddLanguage() {
        this.setState({ newLang: true });
    }

    langFormOnChange(lang) {
        this.props.addAvailableLanguage(lang)
    }

    langFormOnCancel() {
        this.setState({ newLang: false });
    }

    renderNewLang() {
        const { availableLanguages } = this.props;
        const { newLang } = this.state;

        if (newLang) {
            return (
                <Form.Item {...tailLayout}>
                    <SelectLanguageForm 
                        languages={availableLanguages} 
                        onChange={this.langFormOnChange}
                        onCancel={this.langFormOnCancel}
                    />
                </Form.Item>
            );
        }

        return (
            <Form.Item {...tailLayout}>
                <Button type="dashed" onClick={this.handleAddLanguage} icon={<PlusOutlined />} block>
                    {t("Add language", "form")}
                </Button>
            </Form.Item>
        );
    }

    renderAddonButton() {
        return (
            <Button
                onClick={this.handleAddonPress}
                type="text"
                size="medium"
                icon={<EllipsisOutlined />}
            />
        );
    }

    renderML() {
        const { availableLanguages } = this.props;
        const { opened, ml_temp } = this.state;

        if (opened !== true) return null;

        return (
            <Modal
                visible
                footer={null}
                title={t("ml_form_title", "form")}
                onOk={this.handleMlModalConfirm}
                onCancel={this.handleModalClose}
                size="small"
            >
                <div className="ml-lang-list-container">
                    <Form
                        {...layout}
                        ref={this.formRef}
                        name="ml-form"
                        onFinish={this.handleMLFormConfirm}
                        initialValues={ml_temp}
                    >
                        {
                            _.map(availableLanguages, (l) => {
                                const lang = LANGUAGES[l];

                                if (_.isPlainObject(lang)) {
                                    return (
                                        <Form.Item name={lang.id} label={lang.name} key={`lang_input_${lang.id}`}>
                                            <Input />
                                        </Form.Item>
                                    );
                                }
                            })
                        }

                        {
                            this.renderNewLang()
                        }

                        <Form.Item {...tailLayout}>
                            <Button type="primary" htmlType="submit">
                                {t("Save", "common")}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        );
    }

    render() {
        const { value } = this.state;
        const { errors, field, disabled } = this.props;

        if (!field) return null;

        const hasErrors = errors && errors.length > 0;

        const props = this.getComponentProps();

        return (
            <>
                <TextInput
                    className="addon-no-padding"
                    {...props}
                    disabled={disabled}
                    input={field}
                    type='text'
                    error={hasErrors}
                    value={value}
                    onChange={!disabled ? this.handleInputChange : null}
                    addonAfter={this.renderAddonButton()}
                />

                {this.renderML()}
            </>
        );
    }
}

const mapStateToProps = (state) => {
    const { availableLanguages, langCode, defaultLangCode } = state.options;

    return {
        availableLanguages,
        lang: langCode,
        defaultLang: defaultLangCode
    };
}

const mapDispatchToProps = { 
    addAvailableLanguage
};

export default connect(mapStateToProps, mapDispatchToProps)(MLTextField);