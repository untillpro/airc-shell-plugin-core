import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

class App extends PureComponent {
    renderActions() {
        return "-- actions -- ";
    }

    render() {
        const { actions, record } = this.props;

        return (
            <div>
                {this.renderActions()}
            </div>
        );
    }
}



export default connect()(App);