import React from 'react';
import {ClearFix, Mixins, Styles} from 'material-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';

let {StylePropable, StyleResizable} = Mixins;
let DesktopGutter = Styles.Spacing.desktopGutter;

const FullWidthSection = React.createClass({
  contextTypes: {
	muiTheme: React.PropTypes.object.isRequired
  },	
  propTypes: {
    children: React.PropTypes.node,
    contentStyle: React.PropTypes.object,
    contentType: React.PropTypes.string,
    style: React.PropTypes.object,
    useContent: React.PropTypes.bool,
  },

  mixins: [
    StylePropable,
    StyleResizable,
  ],

  getDefaultProps() {
    return {
      useContent: false,
      contentType: 'div',
    };
  },

  getStyles() {
    return {
         };
  },

  render() {
    let {
      style,
      useContent,
      contentType,
      contentStyle,
      ...other,
    } = this.props;

    let styles = this.getStyles();

    let content;
    if (useContent) {
      content =
        React.createElement(
          contentType,
          {style: this.mergeStyles(styles.content, contentStyle)},
          this.props.children
        );
    } else {
      content = this.props.children;
    }

    return (
      <ClearFix
        {...other}
        style={this.mergeStyles(
          styles.root,
          style,
          this.isDeviceSize(StyleResizable.statics.Sizes.SMALL) && styles.rootWhenSmall,
          this.isDeviceSize(StyleResizable.statics.Sizes.LARGE) && styles.rootWhenLarge)}
      >
        {content}
      </ClearFix>
    );
  },
});

export default muiThemable()(FullWidthSection);
