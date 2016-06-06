import React from 'react';
import AppBar from 'material-ui/AppBar';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import {Card, CardTitle}  from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {colors} from 'material-ui/styles';
import AppLeftNav from '../components/app-left-nav';
import Clipboard from '../components/clipboard';
import ClipboardVisibilityButton from '../components/clipboard-visibility-button';
import ContentDetail from '../components/content-detail';
import { addSnippetToClipboard, toggleClipboard, clearClipboard } from '../actions/clipboard-actions';
import { connect } from 'react-redux';
import Snackbar from 'material-ui/Snackbar';
import { similaritySearch, startKeywordSearch, keywordSearch, clearSearch, addSearchResults } from '../actions/search-actions';
import { clearWorkspace, setInWorkspace} from '../actions/selected-actions';
import { getArticleCount } from '../actions/article-count-actions';
import { showSnackbarMessage, closeSnackbar} from '../actions/snackbar-actions';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import ArrowForward from 'material-ui/svg-icons/navigation/arrow-forward';
import IconButton from 'material-ui/IconButton';
import { ActionCreators as UndoActionCreators } from 'redux-undo'
import RaisedButton from 'material-ui/RaisedButton';

import SearchHelpDialog from '../components/search-help-dialog';

const Master = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        muiTheme: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            enteredSearchText: ''
        };
    },
    componentWillReceiveProps(nextProps) {
        if (this.props.searchData.searchText != nextProps.searchData.searchText) {
            this.setState({enteredSearchText: nextProps.searchData.searchText});
        }
    },
    componentDidMount: function() {
        this.props.onGetArticleCount();
    },

    handleSearchChange(event) {
        this.setState({enteredSearchText: event.target.value});
    },

    handleSearchKeypress(e) {
        if (e.keyCode != 13) {
            return;
        }
        this.props.onStartKeywordSearch(this.state.enteredSearchText);
        this.props.onKeywordSearch(this.state.enteredSearchText, 0);
    },

    handleSelectedForWorkspace(content, inWorkspace) {
        this.props.onSetInWorkspace(content, inWorkspace);
    },
    handleContentAction(content, action, params) {  // eslint-disable-line no-unused-vars
        if (action=="similar") {
            this.clearSearch();
            this.props.onSimilaritySearch([content.pk]);
        }
    },
    onFindSimilarMultiple() {
        this.clearSearch();
        this.props.onSimilaritySearch(this.props.selectedData.map((content) => {
            return content.pk; 
        }));
    },
    clearSearch() {
        this.setState({enteredSearchText: ""});
        this.props.onClearSearch();
    },
    unSelectAll() {
        this.props.onClearWorkspace();
    },
    render() {
        let styles = this.props.muiTheme;

        let title = (<span>Virtual Research Assistant <i className='small'>({this.props.articleCount} articles and counting...)</i></span>);
        let showMenuIconButton = false;
        let clipboardDocked = true;
        let clipboardWidth = 450;

        let that = this;
        let contentItems = this.props.selectedData.map(function(content) {  
            return (
                <ContentDetail key={content.pk} style={styles.fullWidthSection} content={content} onAction={that.handleContentAction}/> 
            );
        });
        let disabled=false;
        if (contentItems.length == 0) {
            contentItems = [
                (<Card key={"empty"}><CardTitle title="Please select content"/></Card>)
            ];
            disabled=true;
        }
        let unSelectAllButton =  (<RaisedButton primary={true} onMouseUp={this.unSelectAll} label="Unselect All Content" disabled={disabled} />);
        let similarSearchButton = (<RaisedButton primary={true} label="Find Similar Documents" onMouseUp={this.onFindSimilarMultiple} disabled={disabled}/> );
        // XXX: This is really hacky - there are styles from the theme that we're setting in the theme.js
        // but then we are extracting them from the theme and passing in the containerStyle and style, because
        // I haven't figured out exactly  how to structure the entries in theme.js
        // XXX: Also a hack in the snackbar to force fontFamily - this may be a bug in material-ui
        return (
            <div style={styles.root}>
                <AppBar
                    ref='appBar'
                    title={title}
                    titleStyle={styles.appBar.content}
                    zDepth={0}
                    style={styles.appBar}
                    showMenuIconButton={showMenuIconButton} >
                    <ToolbarGroup>
                        <IconButton disabled={!this.props.canUndoSearch} onClick={this.props.onUndo}><ArrowBack/></IconButton>
                        <IconButton disabled={!this.props.canRedoSearch} onClick={this.props.onRedo}><ArrowForward/></IconButton>
                    </ToolbarGroup>
                    <ToolbarGroup float='right'>
                        <TextField value={this.state.enteredSearchText} hintText='Search' onChange={this.handleSearchChange} onKeyDown={this.handleSearchKeypress} />
                        <SearchHelpDialog /> 
                        <ClipboardVisibilityButton
                        onClick={this.props.onClipboardVisibilityClick}
                        open={this.props.clipboardVisibility} />
                    </ToolbarGroup>
                </AppBar>
                <AppLeftNav
                    onChangeSelected={this.handleSelectedForWorkspace}
                    displayedContent={this.props.searchData.searchResultData}
                    workspaceContent={this.props.selectedData}
                    totalCount={this.props.searchData.searchResultTotalCount}
                    searchType={this.props.searchData.searchType}
                    searchText={this.props.searchData.searchText}
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
                    <Toolbar> 
                        <ToolbarGroup>
                            <ToolbarTitle style={{color:colors.black, fontWeight: "bold", fontFamily:this.props.muiTheme.baseTheme.fontFamily}} text="Workspace"/>
                        </ToolbarGroup>
                        <ToolbarGroup >
                            {unSelectAllButton}
                            {similarSearchButton}
                        </ToolbarGroup>
                    </Toolbar>
                    {contentItems}
                </div>
                <Snackbar
                    style={{fontFamily: this.props.muiTheme.baseTheme.fontFamily, textAlign: "center"}}
                    open={this.props.snackbar.open}
                    message={this.props.snackbar.message}
                    onRequestClose={() => this.props.onCloseSnackbar()}
                />
            </div>
            );
    },
    getItems({startIndex, stopIndex}) {
        // XXX: We are assuming we are getting more searchItems for paging, This is probably a bad assumption moving forward
        this.props.onKeywordSearch(this.props.searchData.searchText, startIndex, stopIndex-startIndex);
    }
});

const mapStateToProps = (state) => {
    return {
        clipboardVisibility: state.clipboardVisibility,
        articleSnippetList: state.articleSnippetList,
        searchData: state.searchData.present,
        selectedData: state.selectedData,
        articleCount: state.articleCount,
        snackbar: state.snackbar,
        canUndoSearch: state.searchData.past.length > 0,
        canRedoSearch: state.searchData.future.length > 0
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onClipboardVisibilityClick: () => {
            dispatch(toggleClipboard());
        },
        addSnippet: (id, title, snippet) => {
            dispatch(addSnippetToClipboard(id, title, snippet));
        },
        onClearClipboard: () => {
            dispatch(clearClipboard());
        },
        onStartKeywordSearch: (text) => {
            dispatch(startKeywordSearch(text));
        },
        onKeywordSearch: (text, reset, offset, limit) => {
            dispatch(keywordSearch(text, offset, limit));
        },
        onSimilaritySearch: (content_ids) => {
            dispatch(similaritySearch(content_ids));
        },
        onClearSearch: () => {
            dispatch(clearSearch());
        },
        onAddSearchResults: (results, start, totalCount) => {
            dispatch(addSearchResults(results, start, totalCount));
        },
        onClearWorkspace: () => {
            dispatch(clearWorkspace());
        },
        onSetInWorkspace: (content, inWorkspace) => {
            dispatch(setInWorkspace(content, inWorkspace));
        },
        onGetArticleCount: () => {
            dispatch(getArticleCount());
        },
        onCloseSnackbar: () => {
            dispatch(closeSnackbar());
        },
        onShowSnackbarMessage: (message) => { 
            dispatch(showSnackbarMessage(message));
        },
        onUndo: () => dispatch(UndoActionCreators.undo()),
        onRedo: () => dispatch(UndoActionCreators.redo())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(muiThemeable()(Master));
