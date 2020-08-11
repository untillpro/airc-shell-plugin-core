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
    },
    defaultCurrency: {
        "code": "Euro",
        "digcode": 0,
        "eurozone": 1,
        "id": 5000000058,
        "name": "Euro",
        "rate": 1,
        "round": 2,
        "state": 1,
        "sym_alignment": 1,
        "symbol": "€"
    },
    currency: null
};

export default (state = INITIAL_STATE, action) => {
    return state;
};