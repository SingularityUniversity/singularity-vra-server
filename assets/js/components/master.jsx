import React from 'react';
import $ from 'jquery';
import AppBar from 'material-ui/lib/app-bar';
import IconButton from 'material-ui/lib/icon-button';
import {Spacing} from 'material-ui/lib/styles';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import TextField from 'material-ui/lib/text-field';
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

  componentWillMount() {
    this.setState({
      muiTheme: this.state.muiTheme,
    });
  },

  // XXX: figure out what search we want for initial data
  loadObjectsFromServer: function() {
    $.ajax({
      url: '/api/v1/search',
      data: 'q=space',
      success: (data) => {
        console.log('initial search on: space');
        this.setState({data: data.hits.hits});
        this.setState({content: data.hits.hits[0]._source.fields});
      },
      error: (xhr, status, err) => {
        // XXX: display error popup or something here
        console.log(xhr, status);
      }
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
      fullWidthSection: {
      }
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

  handleSearch(e) {
    const searchTerms = e.currentTarget.value;
    $.ajax({
      url: '/api/v1/search',
      data: `q=${searchTerms}`,
      success: (data, textStatus, xhr) => {
        console.log('search on: ', searchTerms);
        this.setState({data: data.hits.hits});
        this.setState({content: data.hits.hits[0]._source.fields});
      },
      error: (xhr, textStatus, errorThrown) => {
        console.log(`search error: ${textStatus}`);
      }
    });
  },

  /* This method corresponds to the onSelectedContent method of 
   * AppLeftNavBar. Thus the content object is the one that 
   * corresponds to the django content model
   */
  handleSelectedContent(content) {
      this.setState({content: content});
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
        paddingBottom: "64px",
        paddingTop: "128px"  // This is the 64 for the app bar + 64 for fixed div at the top of left nav
      };
      styles.root.paddingLeft = 256 + 24;
      styles.fullWidthSection.paddingLeft = 256 + 24;
    }

    return (
      <div>
        <AppBar
          title={title}
          zDepth={0}
          style={styles.appBar}
          showMenuIconButton={showMenuIconButton} >
          <ToolbarGroup float='right'>
            <TextField hintText='Search' onEnterKeyDown={this.handleSearch} />
          </ToolbarGroup>
        </AppBar>
        <AppLeftNav
          style={styles.leftNav}
          history={history}
          location={location}
          docked={docked}
          onRequestChangeList={this.handleRequestChangeList}
          onSelectedContent={this.handleSelectedContent}
          open={leftNavOpen}
          data={this.state.data}
        />
        <FullWidthSection style={styles.fullWidthSection}>
          <ContentDetail content={this.state.content}/> 
          <p style={this.prepareStyles(styles.p)}>
          </p>
        </FullWidthSection>
      </div>
    );
  },
});

export default Master;
