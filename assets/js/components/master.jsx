import React from 'react';
import $ from 'jquery';
import AppBar from 'material-ui/lib/app-bar';
import IconButton from 'material-ui/lib/icon-button';
import {Spacing} from 'material-ui/lib/styles';
import {
  StylePropable,
  StyleResizable,
} from 'material-ui/lib/mixins';

import {
  Colors,
  getMuiTheme,
} from 'material-ui/lib/styles';

import AppLeftNav from './app-left-nav';
import FullWidthSection from './full-width-section';
import ContentDetail from './content-detail';

const Master = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    history: React.PropTypes.object,
    location: React.PropTypes.object,
  },

  childContextTypes: {
    muiTheme: React.PropTypes.object,
  },

  mixins: [
    StylePropable,
    StyleResizable,
  ],

  getInitialState() {
    return {
      muiTheme: getMuiTheme(),
      leftNavOpen: false,
      data: [],
      content: null 
    };
  },

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    };
  },

  loadDummyContent() {
      $.ajax({
      url: '/api/v1/content/402',
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({content: data});
      }.bind(this),
      error: function(xhr, status, err) {
        // XXX: display error popup or something here
        console.log(xhr, status);
      }.bind(this)
    });
  },

  componentWillMount() {
    this.setState({
      muiTheme: this.state.muiTheme,
    });
    this.loadDummyContent();
  },

  // XXX: Just temporary until we hook up the search functionality (unless
  // we want to initially populate the left nav with a list of articles)
  loadObjectsFromServer: function() {
    $.ajax({
      url: '/api/v1/content',
      data: {limit: 10, offset: 0},
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data['results']});
      }.bind(this),
      error: function(xhr, status, err) {
        // XXX: display error popup or something here
        console.log(xhr, status);
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadObjectsFromServer();
  },

  componentWillReceiveProps(nextProps, nextContext) {
    const newMuiTheme = nextContext.muiTheme ? nextContext.muiTheme : this.state.muiTheme;
    this.setState({
      muiTheme: newMuiTheme,
    });
  },

  getStyles() {
    const darkWhite = Colors.darkWhite;

    const styles = {
      appBar: {
        position: 'fixed',
        // Needed to overlap the examples
        zIndex: this.state.muiTheme.zIndex.appBar + 1,
        top: 0,
      },
      root: {
        paddingTop: Spacing.desktopKeylineIncrement,
        minHeight: 400,
      },
      content: {
        margin: Spacing.desktopGutter,
      },
      contentWhenMedium: {
        margin: `${Spacing.desktopGutter * 2}px ${Spacing.desktopGutter * 3}px`,
      },
      footer: {
        backgroundColor: Colors.grey900,
        textAlign: 'center',
      },
      a: {
        color: darkWhite,
      },
      p: {
        margin: '0 auto',
        padding: 0,
        color: Colors.lightWhite,
        maxWidth: 335,
      },
      iconButton: {
        color: darkWhite,
      },
    };

    styles.content = this.mergeStyles(styles.content, styles.contentWhenMedium);

    return styles;
  },

  handleRequestChangeList(event, value) {
    this.props.history.push(value);
    this.setState({
      leftNavOpen: false,
    });
  },

  handleChangeMuiTheme(muiTheme) {
    this.setState({
      muiTheme: muiTheme,
    });
  },

  render() {
    const {
      history,
      location,
      children,
    } = this.props;

    const styles = this.getStyles();
    const title = 'Virtual Research Assistant';
    let docked = true;
    let showMenuIconButton = false;
    let leftNavOpen = true;


    if (this.isDeviceSize(StyleResizable.statics.Sizes.LARGE) && title !== '') {
      docked = true;
      leftNavOpen = true;
      showMenuIconButton = false;

      styles.leftNav = {
        zIndex: styles.appBar.zIndex - 1,
      };
      styles.root.paddingLeft = 256 + 24;
      styles.footer.paddingLeft = 256 + 24;
    }

    return (
      <div>
        <AppBar
          title={title}
          zDepth={0}
          style={styles.appBar}
          showMenuIconButton={showMenuIconButton}
        />
        <AppLeftNav
          style={styles.leftNav}
          history={history}
          location={location}
          docked={docked}
          onRequestChangeList={this.handleRequestChangeList}
          open={leftNavOpen}
          data={this.state.data}
        />
        <FullWidthSection style={styles.footer}>
          <ContentDetail content={this.state.content}/> 
          <p style={this.prepareStyles(styles.p)}>
          </p>
        </FullWidthSection>
      </div>
    );
  },
});

export default Master;
