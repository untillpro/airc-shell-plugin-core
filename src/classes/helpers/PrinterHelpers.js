// from base64 string to commands string
export const convert = (integer) => {
    var str = Number(integer).toString(16);
    return (str.length === 1 ? "0" + str : str).toUpperCase();
};

export const  encodePlaceholder = (symbol) => {
    return 4096;
}

export const  decodePlaceholder = (number) => {
    return 'n';
}

export const decodeCommand = (str) => {
    let res = '';
    let base64buf = Buffer.from(str, "base64");

    for (let i = 0; i < base64buf.length; i += 2) {
        if (res !== '') res += "/";

        let v = Buffer.from([base64buf[i], base64buf[i + 1]]).readInt16LE(0);

        if (v > 255) {
            res += decodePlaceholder(v);
        } else {
            res += convert(v);
        }
    }

    return res;
}

//const encode from commands string to base64 string
export const encodeCommand = (str) => {
    let ops = str.split('/');
    const arr = [];

    if (ops.length > 0) {
        for (let i = 0; i < ops.length; i++) {
            let v = parseInt(ops[i], 16);

            if (typeof v === 'number' && v < 255) {
                arr.push(v);
                arr.push(0);
            } else {
                arr.push(0);
                arr.push(16);
            }
        }
    }

    const uintArr = Uint16Array.from(arr);
    const buf = Buffer.from(uintArr);

    return buf.toString('base64');
}

export const isValidCommand = (str) => {
    let reg = /^(([0-9a-fA-F]{2}|n)(\/([0-9a-fA-F]{2}|n))*)$/;

    return reg.test(str);
}