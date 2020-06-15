import React, { PureComponent } from 'react';

/**
 * props:
 * - type
 *  - string (default)
 *  - number
 *  - price
 * 
 * 
 * - ops for types:
 *  - string:
 *   - maxLength
 * 
 * - number:
 *  - precision
 */

class EMListRowCell extends PureComponent {
    render() {
        const { value } = this.props;

    return <div className="cell-value">{value}</div>;
    }
}

export default EMListRowCell;