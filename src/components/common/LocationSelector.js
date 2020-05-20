/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button } from 'antd';
import { Grid } from 'base/components'    

import { setLocation } from 'actions';

class LocationSelector extends Component {
    constructor() {
        super();

        this.state = {
            input: '',
            error: null
        };
    }

    onSubmit(event) {
        event.preventDefault();
 
        const { input } = this.state;
        const locations = [];
        let error = null;

        if (!input || input === '') return;

        let str = String(input);

        if (str) {
            str = str.replace(/(?!-)[^0-9-,-]/g, '');
            
            if (str.match(/^[0-9]+-{1}[0-9]+$/)) {
                const arr = str.split('-');
                let min = arr[0] ? parseInt(arr[0]) : null;
                let max = arr[1] ? parseInt(arr[1]) : null;

                if (min > 0 && max > 0 && max > min) {
                    for (let i = min; i <= max; i ++) {
                        locations.push(i);
                    }
                } else {
                    error = 'Wrong string format';
                }

            } else {
                const arr = str.split(',');

                if (arr && arr.length > 0) {
                    _.each(arr, (v) => {
                        let n = parseInt(v);

                        if (v && v > 0) {
                            locations.push(n);
                        }
                    })
                } else {
                    error = 'Wrong string format';
                }
            }
        } else {
            error = 'Wrong string format';
        }

        if (locations.length > 0) {
            this.props.setLocation(locations);
        } else {
            error = 'You shoul specify locations'
        }

        this.setState({
            error
        });
        
        return false;
    }

    renderSelector() {
        const { error } = this.state;

        return (
            <div>
                <Form layout="inline" onSubmit={this.onSubmit.bind(this)}>
                    <Form.Item validateStatus={!!error ? 'error' : ''}>
                        <Input
                            placeholder='"1, 2, 3" or "1-5" or "10"'
                            onChange={(val) => this.setState({ input: val.target.value })}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Set
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }

    renderLocations() {
        const { locations } = this.props;

        return (
            <div style={styles.selectedLocations}>
                Locations selected: {locations.join(', ')}
            </div>
        );
    }

    render() {
        const { show_selector } = this.props;

        if (!show_selector) return null;

        return (
            <div style={styles.container}>
                <Grid rows={1} cols={2}>
                    {this.renderSelector()}
                    {this.renderLocations()}
                </Grid>
            </div>
        );
    }
};

const styles = {
    container: {
        marginBottom: 20
    },
    selectedLocations: {
        fontSize: 12,
        color: '#787878',
        textAlign: 'right',
        lineHeight: '40px'
    }
};

const mapStateToProps = (state) => {
    const { locations, show_selector } = state.bo;

    if (!show_selector) return {};

    return {
        show_selector,
        locations
    };
};

export default connect(mapStateToProps, {setLocation})(LocationSelector);