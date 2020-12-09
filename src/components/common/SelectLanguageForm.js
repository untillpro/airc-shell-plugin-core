/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import { translate as t } from 'airc-shell-core';
import { Form, Select, Button } from 'antd';

import { LANGUAGES } from '../../const';

const { Option } = Select;

class SelectLanguageForm extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            languages: []
        };

        this.handleFinish = this.handleFinish.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    componentDidMount() {
        const { languages: selected } = this.props;

        if (_.size(LANGUAGES) > 0) {
            let languages = [];

            _.forEach(LANGUAGES, (langObj) => {
                if (_.isPlainObject(langObj)) {
                    if (langObj.id && selected.indexOf(langObj.id) < 0) {
                        languages.push({
                            code: langObj.id,
                            name: langObj.name
                        });
                    }
                }
            });

            this.setState({ languages });
        } else {
            throw new Error('No languages available. Check LANGUAGES const file.');
        }
    }

    handleFinish(values) {
        const { onChange } = this.props;
        const { language } = values;

        if (_.isString(language) && _.isFunction(onChange)) {
            onChange(language);
        }
    }

    handleCancel() {
        const { onCancel } = this.props;

        if (_.isFunction(onCancel)) {
            onCancel();
        }
    }

    renderSelector() {
        const { languages } = this.state;

        return (
            <Form.Item 
                name="language" 
                label={t("Language", "form")}
            >
                <Select
                    showSearch
                    placeholder={t("Select a language", "form")}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {languages.map(lang => {
                        return (<Option value={lang.code}>{lang.name}</Option>);
                    })}
                </Select>
            </Form.Item>
        );
    }

    render() {

        return (
            <Form
                name="language_add_form"
                layout="inline"
                onFinish={this.handleFinish}
            >

                {this.renderSelector()}

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        {t("Submit", "common")}
                    </Button>
                </Form.Item>

                <Form.Item>
                    <Button onClick={this.handleCancel}>
                        {t("Cancel", "common")}
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

export default SelectLanguageForm;