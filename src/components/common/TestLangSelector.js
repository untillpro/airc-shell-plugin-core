/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { Select } from 'antd';

import { setLanguage } from '../../actions/';

const { Option } = Select;

const MOCK_LANG = {
    "en": {
        "name": "English",
        "code": "0000",
        "locale": "en",
        "iso": "en-EN",
    },
    "ru": {
        "name": "Русский",
        "code": "0419",
        "locale": "ru",
        "iso": "ru-RU",
    }
};

class TestLangSelector extends PureComponent {
    constructor() {
        super();

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate() {
        console.log("TestLangSelector.componentDidUpdate: ", this.props);
    }

    handleChange(code) {
        console.log("Test lang selector changed: ", code);

        if (MOCK_LANG[code]) {
            this.props.setLanguage(MOCK_LANG[code]);
        }
    }

    render() {
        const { currentLanguage } = this.props;

        return (
            <div className="test-lang-selector">
                <Select defaultValue={currentLanguage} onChange={this.handleChange} style={{width: "100%"}}>
                    {_.map(MOCK_LANG, (v, k) => <Option key={`opt_${k}`} value={k}>{v.name}</Option>)}
                </Select>
            </div>
        );
    }
}

const mapStateToPtops = (state) => {
    const { currentLanguage } = state.options;

    return { currentLanguage };
};

const mapDispatchToProps = { setLanguage };


export default connect(mapStateToPtops, mapDispatchToProps)(TestLangSelector);
