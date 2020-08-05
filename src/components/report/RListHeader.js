import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { DatePicker, Space } from 'antd';

import { Toggler, Button, DatePickerLight } from '../../base/components/';

const { RangePicker } = DatePicker;

class RListHeader extends PureComponent {
    constructor(props) {
        super(props);

        this.handleDateFilterChange = this.handleDateFilterChange.bind(this);
    }

    handleDateFilterChange(values) {

    }

    renderFilter() {
        const { from, to } = this.props;

        return (
            <div className='untill-base-table-header-togglers'>
                <DatePickerLight 
                    from={from} 
                    to={to} 
                    format="DD/MM/YYYY HH:mm"
                />
            </div>
        );
    }

    renderActions() {
        return (
            <div className='untill-base-table-header-actions'>
                <Button
                    icon='reload'
                    key='header-action-add'
                    onClick={() => { }}
                />
            </div>
        );
    }

    render() {
        return (
            <div className='untill-base-table-header header-actions'>
                {this.renderFilter()}
                {this.renderActions()}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { 
        fromDateTime: from, 
        toDateTime: to 
    } = state.reports;


    return { from, to };
};

export default connect(mapStateToProps, null)(RListHeader);
