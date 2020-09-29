import React from "react";
import { Input } from "antd";

const StringFilter = (props) => {
    const { onChange } = props;

    return (
        <Input 
            placeholder={"Test"}
            onChange={(e) => onChange(e.target.value)} 
            allowClear={true}
        />
    );
};

export default StringFilter