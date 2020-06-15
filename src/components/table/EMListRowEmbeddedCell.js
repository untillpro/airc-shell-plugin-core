import React, { PureComponent } from 'react';

/*
    props: 
        - wsid
        - id
*/
class EMListRowEmbeddedCell extends PureComponent {
    render() {
        const { value } = this.props;

    return <div className="cell-value">{value}</div>;
    }
}

export default EMListRowEmbeddedCell;