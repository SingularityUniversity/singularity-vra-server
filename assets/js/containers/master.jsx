import React from 'react';
import $ from 'jquery';
import AppBar from 'material-ui/AppBar';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {Card, CardActions, CardHeader, CardText, CardTitle}  from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';
import AppLeftNav from '../components/app-left-nav';
import Clipboard from '../components/clipboard';
import ClipboardVisibilityButton from '../components/clipboard-visibility-button';
import SelectableContentDetail from '../containers/selectable-content-detail';
import { addSnippetToClipboard, toggleClipboard, 
         clearClipboard } from '../actions/clipboard-actions';
import { connect } from 'react-redux';
import Snackbar from 'material-ui/Snackbar';
import { keywordSearch, clearSearch } from '../actions/search-actions';

const Master = React.createClass({
  propTypes: {
    children: React.PropTypes.node,
    history: React.PropTypes.object,
    location: React.PropTypes.object,
	muiTheme: React.PropTypes.object.isRequired,
  },

  searchField: null,

  getInitialState() {
    return {
      data: [],
	  query_topics: [], // LDA query topics - [ [ [(term, weight),...], topicweight]...]
      resultCountTotal: 0,
      articleCount: 0,
      searchType: "",
      selected: [],
      searchQuery: '',
      scrollOffset: 0,
      snackbarOpen: false,
      snackbarMessage: ''
    };
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
    this.getArticleCountFromServer();
  },

  handleSearchChange(event) {
      this.setState({searchQuery: event.target.value});
  },

  handleSearchKeypress(e) {
	if (e.keyCode != 13) {
		return;
	}
    this.props.onKeywordSearch(this.state.searchQuery);
  },

  doSearch(query, reset_selected, offset, limit) {
      // IMPORTANT:  This function is called by componentWillReceiveProps,
      // so this.props is in the "previous" state.  Be careful about using
      // any props that might be changing.
      if (!offset) {
          offset=0;
      }
      if (!limit) {
          limit=50;
      }
      // XXX: Are there situations where offset=0 and we aren't doing a new search?
      if (offset == 0) {
          this.setState({
              snackbarOpen: true,
              snackbarMessage: (
                      <span> 
                      Doing a content search with <em>{query}</em>
                      </span>)
          });
      }
      
      let that = this;
      return $.ajax({
          url: '/api/v1/search',
          data: `q=${query}&offset=${offset}&limit=${limit}`, 
          success: (data, textStatus, xhr) => {
              this.state.data.splice(offset, data.hits.total, ...data.hits.hits.map(function(x) {return {score: x._score, ...x._source}}))
              this.setState({resultCountTotal: data.hits.total,
                  searchType: 'Keyword search',
                  data: this.state.data,
                  scrollOffset: offset+limit, 
                  selected: reset_selected ? [] : that.state.selected,
                  searchQuery: query,
                  lastScrollPage: (offset+limit > data.hits.total)
              });
          },
          error: (xhr, textStatus, errorThrown) => {
              console.log(`search error: ${textStatus}`);
          }
      });
  },

  handleSelectedContent(content, selected) {
      // XXX: choose a better data structure to make this more simple
      if (!selected) { // Turn off membership in selected - filter out if it somehow exists in the selected list
          let filtered_selected = this.state.selected.filter(function(selected_content) {
              return (content.pk != selected_content.pk)
          });
          this.setState({selected: filtered_selected});
      }
      let alreadySelected = false;
      this.state.selected.forEach(function(selected_content) {
          if (selected_content.pk == content.pk) {
              alreadySelected = true;
          }
      });
      
      if (!alreadySelected) {
          let selected = this.state.selected;
          selected.push(content);
          this.setState({selected: selected});
      }
  },
  handleContentAction(content, action, params) {
	  if (action=="similar") {
        this.clearSearch();
		this.doSimilaritySearch([content.pk]);
	  }
  },
  onFindSimilarMultiple() {
      this.clearSearch();
      this.doSimilaritySearch(this.state.selected.map((content) => {
          return content.pk; 
      }));
  },
  clearSearch() {
      this.setState({searchQuery: ""});
      this.props.onClearSearch();
  },
  doSimilaritySearch(content_ids) {
      let that = this;
      this.setState({
          snackbarOpen: true,
          snackbarMessage: "Doing a similarity search"
      });
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
  componentWillReceiveProps(nextProps) {
      if ((nextProps.articleSnippetList != this.props.articleSnippetList) 
              && nextProps.articleSnippetList) {
          if (nextProps.articleSnippetList.length > 0) {
              let total_new_snippets = 0;
              let total_old_snippets = 0; 
              for (let x of nextProps.articleSnippetList) {
                  total_new_snippets += x.snippets.length
              }
              for (let x of this.props.articleSnippetList) {
                  total_old_snippets += x.snippets.length
              }
              if (total_new_snippets > total_old_snippets) {
                  this.setState({
                      snackbarOpen: true,
                      snackbarMessage: "Content copied to clipboard"
                  });
              }
            }
      }

      if ((nextProps.keywordSearchText != this.props.keywordSearchText) &&
          nextProps.keywordSearchText !== null && 
          nextProps.keywordSearchText != '') {
        this.doSearch(nextProps.keywordSearchText, true, 0);
      }
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
    let showMenuIconButton = false;
    let clipboardDocked = true;
    let clipboardWidth = 450;

    let that = this;
    let contentItems = this.state.selected.map(function(content) {  
        return (
                <SelectableContentDetail key={content.pk} style={styles.fullWidthSection} content={content} onAction={that.handleContentAction}/> 
               );
    });
    if (contentItems.length == 0) {
        contentItems = [
            (<Card key={"empty"}><CardTitle title="Please select content"/></Card>)
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
            <TextField value={this.state.searchQuery} hintText='Search' ref="searchField"  onChange={this.handleSearchChange} onKeyDown={this.handleSearchKeypress} />
            <ClipboardVisibilityButton
              onClick={this.props.onClipboardVisibilityClick}
              open={this.props.clipboardVisibility} />
          </ToolbarGroup>
        </AppBar>
        <AppLeftNav
          onChangeSelected={this.handleSelectedContent}
          onFindSimilar={this.onFindSimilarMultiple}
          displayedContent={this.state.data}
          selectedContent={this.state.selected}
          totalCount={this.state.resultCountTotal}
          searchType={this.state.searchType}
          loadItems={this.getItems}
        />
        <Clipboard 
          docked={clipboardDocked}
          open={this.props.clipboardVisibility}
          openSecondary={true} 
          width={clipboardWidth} 
          articleSnippetList={this.props.articleSnippetList}
          onClear={this.props.onClearClipboard} />
        <div style={styles.fullWidthSection.root}>
        {contentItems}
        </div>
        <Snackbar
        style={{textAlign: "center"}}
            open={this.state.snackbarOpen}
            message={this.state.snackbarMessage}
            autoHideDuration={2500}
            onRequestClose={() => this.setState({'snackbarOpen': false})}
        />
      </div>
    );
  },
  getItems({startIndex, stopIndex}) {
    // XXX: We are assuming we are getting more searchItems for paging, This is probably a bad assumption moving forward
   let promise = this.doSearch(this.props.keywordSearchText, false, startIndex, stopIndex-startIndex);

  }
});

const mapStateToProps = (state) => {
  return {
    clipboardVisibility: state.clipboardVisibility,
    articleSnippetList: state.articleSnippetList,
    keywordSearchText: state.keywordSearchText
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onClipboardVisibilityClick: (openState) => {
      dispatch(toggleClipboard());
    },
    addSnippet: (id, title, snippet) => {
      dispatch(addSnippetToClipboard(id, title, snippet));
    },
    onClearClipboard: () => {
      dispatch(clearClipboard());
    },
    onKeywordSearch: (text) => {
      dispatch(keywordSearch(text));
    },
    onClearSearch: () => {
      dispatch(clearSearch());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(muiThemeable()(Master));
