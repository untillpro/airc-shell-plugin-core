/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

const INITIAL_STATE = {
    lang: 'en', //todo
    maxUploadImageSize :102400,
    showLocationSelector: true,
    locations: {
        1: "UI Development",
        2: "Server Development",
        3: "QA",
        4: "Demo",
    }
};

export default (state = INITIAL_STATE, action) => {
    return state;
};