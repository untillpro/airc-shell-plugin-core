import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Empty, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';


class TableAreaImageSelect extends PureComponent {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.customRequest = this.customRequest.bind(this);
    }

    handleChange(info) {
        const { setImage } = this.props;

        if (info.file.status === 'done') {
            if (_.isFunction(setImage)) {
                if (_.isPlainObject(info.file.response)) {
                    setImage(info.file.response);
                } else {
                    message.error(info.file.response);
                }
            }

            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    }

    customRequest(data) {
        const { context } = this.props;
        const { api } = context;

        api.blob(data);
    }

    render() {
        const props = {
            onChange: this.handleChange,
            customRequest: this.customRequest,
            name: 'file',
            multiple: false,
        };

        return (<div className="table-area-image-selector">
            <Empty description="Please select a plan image" />

            <Upload {...props}>
                <Button icon={<UploadOutlined />} className="upload-button">
                    Click to Upload
                </Button>
            </Upload>
        </div>);
    }
}

TableAreaImageSelect.propTypes = {
    context: PropTypes.object.isRequired,
    setImage: PropTypes.func.isRequired,
};

export default TableAreaImageSelect;