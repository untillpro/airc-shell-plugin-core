import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import { setLocation } from '../../actions';

class LocationSelector extends PureComponent {
    constructor() {
        super();

        this.handleChange = this.handleChange.bind(this);
    }

    render() {
        return (<div className="location-selector">Location selector...</div>);
    }
}

LocationSelector.propTypes = {
    locations: PropTypes.array.isRequired,
    locationsOptions: PropTypes.object,
    locationsGroups: PropTypes.array
};

const mapStateToProps = (state) => {
    const { locations, locationsOptions, locationsGroups } = state.locations;

    return (
        locations,
        locationsOptions,
        locationsGroups
    );
}

const mapDispatchToProps = {
    setLocation
};


export default connect(mapStateToProps, mapDispatchToProps)(LocationSelector);

