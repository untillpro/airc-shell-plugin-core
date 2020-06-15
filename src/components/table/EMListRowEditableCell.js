import React, { PureComponent } from 'react';

class EMListRowEditableCell extends PureComponent {
    render() {
        const { value } = this.props;

    return <div className="cell-value">{value}</div>;
    }
}

export default EMListRowEditableCell;