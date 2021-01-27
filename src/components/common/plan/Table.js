import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ResizableRect from './ResizeableRect';

import { getBoundPosition, getRotatedSizes, toRadians, mround } from 'airc-shell-core';

class Table extends PureComponent {
    constructor(props) {
        super(props);

        this.margin = 8;

        this.state = {
            width: 0,
            height: 0,
            top: 0,
            left: 0,
            angle: 0,
            info: '',
            showInfo: false,
            round: 10
        };

        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);

        this.handleResizeStart = this.handleResizeStart.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleResizeEnd = this.handleResizeEnd.bind(this);

        this.handleRotateStart = this.handleRotateStart.bind(this);
        this.handleRotate = this.handleRotate.bind(this);
        this.handleRotateEnd = this.handleRotateEnd.bind(this);

        this.handleClick = this.handleClick.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
    }

    componentDidMount() {
        const { width, height, top, left, angle } = this.props;

        this.setState({
            width, height, top, left, angle
        });
    }

    //resize

    handleResizeStart() {
        this.setState({ showInfo: true, info: '' });
    }

    handleResize(style, isShiftKey, type) {
        const { bounds } = this.props;
        const { margin } = this;
        let { top, left, width, height, rotateAngle: angle } = style;

        top = Math.round(top);
        left = Math.round(left);
        width = Math.round(width);
        height = Math.round(height);

        if (bounds) {
            const { bottom, right } = bounds;

            let [bx, by] = getRotatedSizes(width + margin, height + margin, angle);

            if (bx + left > right || by + top > bottom) {
                return false;
            }
        }

        this.setState({
            top,
            left,
            width,
            height,
            info: `${width}:${height}`
        });
    }

    handleResizeEnd() {
        const { onChange, index, } = this.props;
        const { width, height, top, left } = this.state;

        if (_.isFunction(onChange)) {
            onChange({
                top,
                left,
                width,
                height
            }, index);
        }

        this.setState({ showInfo: false });
    }

    // rotate

    handleRotateStart() {
        this.setState({ showInfo: true, info: '' });
    }

    handleRotate(angle) {
        this.setState({ angle, info: `${angle}\u00B0; ${Math.sin(toRadians(angle))}` });
    }

    handleRotateEnd() {
        const { onChange, index } = this.props;
        const { angle } = this.state;

        if (_.isFunction(onChange)) {
            onChange({ angle }, index);
        }

        this.setState({ showInfo: false })
    }

    // drag

    handleDragStart() {
        this.setState({ showInfo: true, info: '' });
    }

    handleDrag(deltaX, deltaY) {
        const { margin } = this;
        const { bounds } = this.props;
        const { top, left, width, height, angle } = this.state;

        let x = left + deltaX;
        let y = top + deltaY;

        const [resX, resY] = getBoundPosition(x, y, width + margin, height + margin, angle, bounds);

        const data = {
            left: resX,
            top: resY,
            info: `X: ${resX}; Y: ${resY}`
        };

        this.setState(data);
    }

    handleDragEnd() {
        const { onChange, index } = this.props;
        const { top, left } = this.state;

        if (_.isFunction(onChange)) {
            onChange({ top, left }, index);
        }

        this.setState({ showInfo: false })
    }

    handleClick(event) {
        event.stopPropagation();

        const { onClick, index } = this.props;

        if (_.isFunction(onClick)) {
            onClick(index);
        }
    }

    handleDoubleClick(event) {
        event.stopPropagation();

        const { onDoubleClick, index } = this.props;

        if (_.isFunction(onDoubleClick)) {
            onDoubleClick(index);
        }
    }

    getForm(styles) {
        const { width, height, round } = this.state;
        const { form } = this.props;

        switch (form) {
            case 3: styles["borderRadius"] = `${width}px/${height}px`; return;
            case 2: styles["borderRadius"] = round; return;
            default: return;
        }
    }

    getSize(styles) {
        const { width, height } = this.state;

        if (_.isNumber(width) && width >= 0) {
            styles["width"] = width;
        }

        if (_.isNumber(height) && height >= 0) {
            styles["height"] = height;
        }
    }

    getPosition() {
        const { top, left } = this.props;
        const pos = { x: 0, y: 0 };

        if (_.isNumber(left) && left >= 0) {
            pos.x = left;
        } else {
            pos.x = 0;
        }

        if (_.isNumber(top) && top >= 0) {
            pos.y = top;
        } else {
            pos.y = 0;
        }

        return pos;
    }

    getColor(styles) {
        const { color } = this.props;
        let c = "#ffffff";

        if (_.isString(color)) {
            c = color;
        }

        styles["backgroundColor"] = c;
    }

    renderNumber() {
        const { number } = this.props;
        const { angle } = this.state;
        const styles = { transform: `rotate(${-angle}deg)` };

        return (<span style={styles}>{number}</span>);
    }

    renderInfo() {
        const { showInfo, info } = this.state;

        if (!showInfo) return null;

        return <div className="info">{info}</div>;
    }

    renderCirclePlaces(places, width, height) {
        const result = [];

        let a = 360 / places;

        for (let i = 0; i < places; i++) {
            let angle = a * i;
            let fi = toRadians(angle);

            let x = (width / 2 + (width / 2) * Math.cos(fi));
            let y = (height / 2 + (height / 2) * Math.sin(fi));

            let k = width >= height ? (height / width) : (width / height);
            let rotateAngle = (angle - 90);

            result.push(<div className="place" style={{ left: x, top: y, transform: `rotate(${rotateAngle}deg)` }} num={i} k={k} />)
        }

        return result;
    }

    getSideSits(places, width, height) {
        const min = Math.ceil(places / 4) * 4;
        const half = (min / 2);
        const n = (min / 4);

        let wc, hc, k;

        if (height < width) {
            k = height / width;
        } else {
            k = width / height;
        }

        k = mround(k);

        if (k === 1) {
            wc = hc = n;
        } else {
            if (height < width) {
                hc = Math.round(n * k);
                wc = half - hc;
            } else {
                wc = Math.round(n * k);
                hc = half - wc;
            }
        }

        return [wc, hc];
    }

    renderRecPlaces(places, width, height) {
        const result = [];

        const [wc, hc] = this.getSideSits(places, width, height);

        let xd = Math.floor(width / (wc + 1));
        let yd = Math.floor(height / (hc + 1));

        let count = 0;

        if (width >= height) {
            count = this.generateSide(0, height, xd, 0, 180, wc, count, places, result);
            count = this.generateSide(width, 0, 0, yd, 90, hc, count, places, result);
        } else {
            count = this.generateSide(width, 0, 0, yd, 90, hc, count, places, result);
            count = this.generateSide(0, height, xd, 0, 180, wc, count, places, result);
        }

        return result;
    }

    generateSide(W, H, xd, yd, angle, sits, c, places, result) {
        let count = c;

        for (let k = 0; k < 2; k++) {
            let x = xd + W * k;
            let y = yd + H * k;

            let rotateAngle = angle + (180 * k);

            for (let i = 0; i < sits && count < places; i++) {
                result.push(<div className="place" style={{ left: x, top: y, transform: `rotate(${rotateAngle}deg)` }} num={i} k={k} />);
                x += xd;
                y += yd;
                count++;
            }
        }

        return count;
    }

    renderPlaces() {
        const { width, height } = this.state;
        const { form, places } = this.props;

        if (places && places > 0) {
            let p = parseInt(places, 10);

            if (form === 3) {
                return this.renderCirclePlaces(p, width, height);
            } else {
                return this.renderRecPlaces(p, width, height);
            }
        }

        return null;
    }

    render() {
        let styles = {};
        const { margin } = this;
        const { width, height, left, top, angle } = this.state;
        const { current, } = this.props;

        this.getSize(styles);
        this.getColor(styles);
        this.getForm(styles);

        return (
            <ResizableRect
                className={current ? 'selected' : null}
                left={left}
                top={top}
                width={width + margin}
                height={height + margin}
                rotateAngle={angle}
                zoomable={!current ? '' : 'n, w, s, e, nw, ne, se, sw'}
                rotatable={current}

                onRotateStart={this.handleRotateStart}
                onRotate={this.handleRotate}
                onRotateEnd={this.handleRotateEnd}

                onResizeStart={this.handleResizeStart}
                onResize={this.handleResize}
                onResizeEnd={this.handleResizeEnd}

                onDragStart={this.handleDragStart}
                onDrag={this.handleDrag}
                onDragEnd={this.handleDragEnd}
            >
                <div
                    className={`table-item _bs`}
                    onClick={this.handleClick}
                    onDoubleClick={this.handleDoubleClick}
                    style={styles}
                >
                    {this.renderNumber()}
                    {this.renderInfo()}
                    {this.renderPlaces()}
                </div>
            </ResizableRect>

        );
    }
}

Table.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    form: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
    angle: PropTypes.number.isRequired,
};

export default Table;