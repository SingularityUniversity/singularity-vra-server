import React from 'react';
import IconButton from 'material-ui/IconButton';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';


class ClipboardVisibilityButton extends React.Component {
    arrow() {
        if (this.props.open) {
            return (<KeyboardArrowRight />);
        } else {
            return (<KeyboardArrowLeft />);
        }
    }

    tooltip() {
        if (this.props.open) {
            return 'Close clipboard';
        } else {
            return 'Open clipboard';
        }
    }

    render() {
        return (
            <IconButton
                style={{padding:0, border:0, margin:0, height: 24 , width: 24}}
                tooltip={this.tooltip()}
                onClick={this.props.onClick} 
                tooltipPosition={this.props.tooltipPosition}>
                { this.arrow() }
            </IconButton>
        );
    }
}

export default ClipboardVisibilityButton
