import React from 'react';
import $ from 'jquery';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';


import AppLeftNav from './app-left-nav';
import ContentDetail from './content-detail';

const Master = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    history: React.PropTypes.object,
    location: React.PropTypes.object,
	muiTheme: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      leftNavOpen: false,
      data: [],
      content: null,
      summaries: []  // In theory this should be one piece of state with content
    };
  },

  // XXX: figure out what search we want for initial data
  loadObjectsFromServer: function() {
    $.ajax({
      url: '/api/v1/search',
      data: 'q=space',
      success: (data) => {
        console.log('initial search on: space');
        this.setState({data: data.hits.hits});
        this.setState({content: data.hits.hits[0]._source});
        this.getDocumentSummaries(data.hits.hits[0]._source);
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

  handleRequestChangeList(event, value) {
    this.props.history.push(value);
    this.setState({
      leftNavOpen: false,
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
        this.setState({content: data.hits.hits[0]._source});  // XXX These two always need to go together, better 
        this.getDocumentSummaries(data.hits.hits[0]._source); // abstraction needed
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
      this.setState({content: content, summaries: []});
      this.getDocumentSummaries(content);
  },
  getDocumentSummaries(content) {
       $.ajax({
                url: `/api/v1/content/${content.pk}/summary`,
                success: (data) => {
                    console.log(this, data);
                    this.setState({summaries: data.summary});
                },
                error: (xhr, status, err) => {
                    console.log(xhr, status);
                }
            });

  },


  render() {
    const {
      history,
      location,
      children,
    } = this.props;

    let styles = Object.assign({}, this.props.muiTheme);

    const title = 'Virtual Research Assistant';
    let docked = true;
    let showMenuIconButton = false;
    let leftNavOpen = true;

      docked = true;
      leftNavOpen = true;
      showMenuIconButton = false;

	// XXX: This is really hacky - there are styles from the theme that we're setting in the theme.js
	// but then we are extracting them from the theme and passing in the containerStyle and style, because
	// I haven't figured out exactly  how to structure the entries in theme.js
    return (
      <div>
        <AppBar
          title={title}
          zDepth={0}
		  containerStyle={styles.appBar.root}
          style={styles.appBar.content}
          showMenuIconButton={showMenuIconButton} >
          <ToolbarGroup float='right'>
            <TextField hintText='Search' onEnterKeyDown={this.handleSearch} />
          </ToolbarGroup>
        </AppBar>
        <AppLeftNav
          history={history}
          location={location}
          docked={docked}
          onRequestChangeList={this.handleRequestChangeList}
          onSelectedContent={this.handleSelectedContent}
          open={leftNavOpen}
          data={this.state.data}
        />
          <ContentDetail style={styles.fullWidthSection} content={this.state.content} summaries={this.state.summaries}/> 
          <p style={this.props.muiTheme.prepareStyles(styles.masterBar.p)}>
          </p>
      </div>
    );
  },
});


export default muiThemeable()(Master);
