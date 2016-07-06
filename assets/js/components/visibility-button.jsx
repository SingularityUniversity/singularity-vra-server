import React from 'react';
import IconButton from 'material-ui/IconButton';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';


class VisibilityButton extends React.Component {
    arrow() {
        let isLeft = true;
        if (this.props.side=="right") {
            isLeft = false;
        }
        if ((this.props.open && !isLeft) ||
                (!this.props.open && isLeft)){
            return (<KeyboardArrowRight />);
        } else {
            return (<KeyboardArrowLeft />);
        }
    }

    tooltip() {
        if (this.props.open) {
            return this.props.tooltipOpenedText;
        } else {
            return this.props.tooltipClosedText;
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

VisibilityButton.propTypes={
    open: React.PropTypes.bool.isRequired,
    tooltipPosition: React.PropTypes.string.isRequired,
    tooltipClosedText: React.PropTypes.string.isRequired,
    tooltipOpenedText: React.PropTypes.string.isRequired,
    side: React.PropTypes.string.isRequired // "left" or "right"
}

export default VisibilityButton
