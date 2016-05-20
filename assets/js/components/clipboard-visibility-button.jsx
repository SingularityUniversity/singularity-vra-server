import React from 'react';
import IconButton from 'material-ui/IconButton';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';


const ClipboardVisibilityButton = React.createClass({
  arrow: function() {
    if (this.props.open) {
      return (<KeyboardArrowRight />);
    } else {
      return (<KeyboardArrowLeft />);
    }
  },

  tooltip: function() {
    if (this.props.open) {
      return 'Close clipboard';
    } else {
      return 'Open clipboard';
    }
  },

  render() {
    return (
      <IconButton 
        tooltip={this.tooltip()}
        onClick={this.props.onClick} >
        { this.arrow() }
      </IconButton>
    );
  }
});

export default ClipboardVisibilityButton
