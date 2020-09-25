var v = require('voca');

export const filterString = (source, search, ignoreCase = true) => {
    if (ignoreCase) {
        return v.search(v.lowerCase(source), v.lowerCase(search)) >= 0;
    }
    return v.search(source, search) >= 0;
}