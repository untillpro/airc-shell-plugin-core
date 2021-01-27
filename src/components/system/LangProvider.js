/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import moment from 'moment';
import i18next from 'i18next';

import { 
    initContextLang, 
    sendLanguageChanged 
} from '../../actions';

import 'moment/locale/nl';
import 'moment/locale/nl-be';

const DEFAULT_LANG = 'en';
const DEFAULT_LANG_CODE = '0000';
const DEFAULT_NS = 'translation';

class LangProvider extends PureComponent {
    componentDidMount() {
        const { currentLanguage } = this.props;

        console.log("LangProvider.componentDidMount: current language: " + currentLanguage);

        this.init();
    }

    componentDidUpdate(oldProps) {
        if (this.props.currentLanguage !== oldProps.currentLanguage) {
            this.props.sendLanguageChanged(this.props.currentLanguage);
        }
    }

    init() {
        const { 
            currentLanguage, 
            defaultLanguage, 
            languages, 
            langCode, 
            defaultLangCode
        } = this.props;

        let lng = DEFAULT_LANG;
        let code = DEFAULT_LANG_CODE;

        if (currentLanguage && _.isString(currentLanguage)) {
            lng = currentLanguage;
            code = langCode; 
        } else if (defaultLanguage && _.isString(defaultLanguage)) {
            lng = defaultLanguage;
            code = defaultLangCode;
        }

        if (languages && _.size(languages) > 0) {
            
            i18next.init({
                debug: true,
                fallbackLng: _.keys(languages),
                defaultNS: DEFAULT_NS,
                lng: lng,
                resources: languages,
                interpolation: {
                    escapeValue: false,
                }
            }, (err, t) => {
                if(!err) {
                    this._initEntitiesI18n()
                    moment.locale(lng);
                    this.props.initContextLang(lng, code)
                } else {
                    console.log(err);
                    throw new Error(err);
                }
            });
        } else {
            moment.locale(DEFAULT_LANG);
        }
    }

    _initEntitiesI18n() {
        const { contributions } = this.props;
        
        if (!_.isObject(contributions)) return;

        const points = contributions.getPoints("language");

        if (_.isArray(points) && points.length > 0) {
            points.forEach(entity => {
                const point = contributions.getPoint("language", entity);
                const conts = point.getContributuions();

                _.forEach(conts, (cp, locale) => {
                    const translations = point.getContributuionValue(locale); 

                    i18next.addResourceBundle(locale, DEFAULT_NS, { [`contributions#${entity}`]: translations });
                });
            });
        }
    }

    render() {
        const { currentLanguage } = this.props;

        return (
            <div className="lang-provider-container" key={`lang_${currentLanguage}`}>
                {this.props.children}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const { currentLanguage, defaultLanguage, langCode, defaultLangCode } = state.options;

    return {
        contributions,
        currentLanguage,
        defaultLanguage,
        langCode, 
        defaultLangCode
    };
}

LangProvider.propTypes = {
    children: PropTypes.node.isRequired,
    contributions: PropTypes.object.isRequired,
    currentLanguage: PropTypes.string.isRequired,
    defaultLanguage: PropTypes.string.isRequired,
    languages: PropTypes.object.isRequired,
    initContextLang: PropTypes.func.isRequired,
    sendLanguageChanged: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { 
    initContextLang,
    sendLanguageChanged 
})(LangProvider);

