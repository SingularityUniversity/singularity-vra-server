import React from 'react';
import $ from 'jquery';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {Card, CardActions, CardHeader, CardText, CardTitle}  from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';

import AppLeftNav from './app-left-nav';
import ContentDetail from './content-detail';
import { TEST_ACTION} from '../actions/test-action';
import { store } from '../configure-store';
import { connect } from 'react-redux';

const initialQuery="space";

const Master = React.createClass({
  
  propTypes: {
    children: React.PropTypes.node,
    history: React.PropTypes.object,
    location: React.PropTypes.object,
	muiTheme: React.PropTypes.object.isRequired,
  },
    searchField: null,

  getInitialState() {
    store.dispatch({type: TEST_ACTION})
    return {
      leftNavOpen: false,
      data: [],
	  query_topics: [], // LDA query topics - [ [ [(term, weight),...], topicweight]...]
      resultCountTotal: null,
      articleCount: 0,
      searchType: null,
      selected: [],
      searchQuery: 'space'
    };
  },

  // XXX: figure out what search we want for initial data
  // XXX: Please refactor me to use handleSearch
  doInitialSearch: function() {
      this.setSearch(initialQuery);
    $.ajax({
      url: '/api/v1/search',
      data: 'q='+initialQuery+'&offset=0&limit=250',  // XXX: hardcoded pagination hack (fix with VRA-21)
      success: (data) => {
          this.setState({data: data.hits.hits.map(function(x) { return {score: x._score, ...x._source}}),
              resultCountTotal: data.hits.total,
              searchType: 'Keyword search',
              selected: []});
      },
      error: (xhr, status, err) => {
        // XXX: display error popup or something here
        console.log(xhr, status);
      }
    });
  },

  getArticleCountFromServer: function() {
    $.ajax({
      url: '/api/v1/content/count',
      success: (data) => {
        this.setState({articleCount: data.count});
      },
      error: (xhr, status, err) => {
        console.log(xhr, status);
      }
    });
  },

  componentDidMount: function() {
    this.doInitialSearch();
    this.getArticleCountFromServer();
  },

  handleRequestChangeList(event, value) {
    this.props.history.push(value);
    this.setState({
      leftNavOpen: false,
    });
  },

  handleSearchChange(event) {
      this.setState({searchQuery: event.target.value});
  },
  handleSearch(e) {
	if (e.keyCode != 13) {
		return;
	}
    const searchTerms = e.currentTarget.value;
    $.ajax({
      url: '/api/v1/search',
      data: `q=${searchTerms}&offset=0&limit=250`,  // XXX: Hard coded to max of 250 results. fix this with infinite scrolling (see VRA-21)
      success: (data, textStatus, xhr) => {
          this.setState({resultCountTotal: data.hits.total,
              searchType: 'Keyword search',
              data: data.hits.hits.map(function(x) {return {score: x._score, ...x._source}}),
              selected: []
          });
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
  handleSelectedContent(selected) {
      this.setState({ selected: selected});
  },
  handleContentAction(content, action, params) {
	  if (action=="similar") {
        this.clearSearch();
		this.doSimilaritySearch([content.pk]);
	  }
  },
  onFindSimilarMultiple() {
      this.clearSearch();
      this.doSimilaritySearch(this.state.selected.map((id_index) => {
          return this.state.data[id_index].pk; 
      }));
  },
  setSearch(query) {
      // XXX: Implement with a component that wraps the textarea with state and also lets the textarea value be set
  },
  clearSearch() {
      // XXX: Implement with a component that wraps the textarea with state and also lets the textarea value be set
  },
  doSimilaritySearch(content_ids) {
      let that = this;
       $.ajax({
                url: `/api/v1/similar`,
                method: 'POST',
                contentType: "application/json",
                data: JSON.stringify({'ids': content_ids}),
                success: (data) => {
					let annotated_results = data.results.map(function(item) {
						var content = item.source;
						content.lda_similarity_topics = item.topics;
						content.score = item.weight;
						return content;
					});	
					this.setState({
						query_topics: data.query_topics,
        				data: annotated_results,
                        selected: [],
                        resultCountTotal: annotated_results.length
					});
                    this.setState({searchType: 'Similarity search'});
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

    let styles = this.props.muiTheme;
	

    let title = (
      <span>Virtual Research Assistant <i className='small'>({this.state.articleCount} articles and counting...)</i></span>
    );
    let docked = true;
    let showMenuIconButton = false;
    let leftNavOpen = true;

      docked = true;
      leftNavOpen = true;
      showMenuIconButton = false;
    let that = this;
    let contentItems = this.state.selected.map(function(itemIndex) {  
        let selectedContent = that.state.data[itemIndex];
        return (
                <ContentDetail key={selectedContent.pk} style={styles.fullWidthSection} content={selectedContent} onAction={that.handleContentAction}/> 
               );
    });
    if (contentItems.length == 0) {
        contentItems = [
            (<Card><CardTitle title="Please select content"/></Card>)
        ];
    }
	// XXX: This is really hacky - there are styles from the theme that we're setting in the theme.js
	// but then we are extracting them from the theme and passing in the containerStyle and style, because
	// I haven't figured out exactly  how to structure the entries in theme.js
    return (
      <div style={styles.root}>
        <AppBar
          ref='appBar'
          title={title}
		  titleStyle={styles.appBar.content}
          zDepth={0}
          style={styles.appBar}
          showMenuIconButton={showMenuIconButton} >
          <ToolbarGroup float='right'>
            <TextField defaultValue={initialQuery} hintText='Search' ref="searchField"  onKeyDown={this.handleSearch} />
          </ToolbarGroup>
        </AppBar>
        <AppLeftNav
          docked={docked}
          onRequestChangeList={this.handleRequestChangeList}
          onSelectedContent={this.handleSelectedContent}
          onFindSimilar={this.onFindSimilarMultiple}
          open={leftNavOpen}
          data={this.state.data}
          resultCountTotal={this.state.resultCountTotal}
          searchType={this.state.searchType}
          selectedIndexes={this.state.selected}
        />
        <div style={styles.fullWidthSection.root}>
        {contentItems}
        </div>
      </div>
    );
  },
});

const mapStateToProps = (state) => {
  return {test: state.test}
}

export default connect(mapStateToProps)(muiThemeable()(Master));
