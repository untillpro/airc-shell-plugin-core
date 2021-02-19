import React, { PureComponent } from 'react';
import cn from 'classnames';

class ImageSetSelectorElement extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            visible: false
        };

        this._onLoad = this._onLoad.bind(this);
    }

    _onLoad() {
        this.setState({ visible: true });
    }

    render() {
        const { src, current, contain, cover, onClick, onDoubleClick } = this.props;

        return (
            <div 
                className={cn('grid-element', '--preloader-bg-32-32-gray', { current, contain, cover })} 
                onClick={onClick}
                onDoubleClick={onDoubleClick}
            >
                <div 
                    className="image"
                    style={{ 
                        display: this.state.visible ? 'block' : 'none',
                        backgroundImage: 'url(' + src + ')' 
                    }}
                >
                    <img src={src} onLoad={this._onLoad} />
                </div>
            </div>
        );
    }
}

export default ImageSetSelectorElement;