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
import { createWorkspace, updateWorkspace, getWorkspaces, loadWorkspace, clearWorkspace, setInWorkspace} from '../actions/workspace-actions';
import { getArticleCount } from '../actions/article-count-actions';
import { showSnackbarMessage, closeSnackbar} from '../actions/snackbar-actions';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import ArrowForward from 'material-ui/svg-icons/navigation/arrow-forward';
import IconButton from 'material-ui/IconButton';
import { ActionCreators as UndoActionCreators } from 'redux-undo'
import RaisedButton from 'material-ui/RaisedButton';
import WorkspaceChooser from '../components/workspace-chooser';
import WorkspaceEditor from '../components/workspace-editor';
import SearchHelpDialog from '../components/search-help-dialog';

const Master = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        muiTheme: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            enteredSearchText: '',
            workspaceChooserVisible: false,
            workspaceEditorVisible: false,
            workspaceEditorCreating: false,
            workspacesOnServer: []
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
        this.props.onSimilaritySearch(this.props.workspaceData.articles.map((content) => {
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
    showLoadWorkspace() {
        this.props.onGetWorkspaces()
            .then(workspaceList => 
                this.setState( { workspacesOnServer: workspaceList, workspaceChooserVisible: true }))
            .catch(error => {
                this.onShowSnackbarMessage("There was an error getting list of workspaces");
            });
    },
    chooseWorkspace(workspaceId) {
        this.props.onLoadWorkspace(workspaceId).
            then(() => this.setState({workspaceChooserVisible: false})).
            catch(error => this.props.onShowSnackbarMessage("There was an error loading workspace: "+error));
    },
    showUpdateWorkspace() {
        this.setState({
            workspaceEditorVisible: true,
            workspaceEditorCreating: false,
        });
    },
    showCreateWorkspace() {
        this.setState({
            workspaceEditorVisible: true,
            workspaceEditorCreating: true,
        });
    },
    cancelWorkspaceEditor() {
        this.setState({
            workspaceEditorVisible: false
        });
    },
    submitWorkspace(workspaceData) {
        if (workspaceData.id) {
            this.props.onUpdateWorkspace(workspaceData).
            then(() => this.setState({workspaceEditorVisible: false})).
            catch(error => this.props.onShowSnackbarMessage("There was an error updating workspace: "+error));
        } else {
            this.props.onCreateWorkspace(workspaceData).
            then(() => this.setState({workspaceEditorVisible: false})).
            catch(error => this.props.onShowSnackbarMessage("There was an error saving new workspace: "+error));
        }
    },
    cancelChooseWorkspace() {
        this.setState({workspaceChooserVisible: false});
    },
    render() {
        let styles = this.props.muiTheme;

        let title = (<span>Virtual Research Assistant <i className='small'>({this.props.articleCount} articles and counting...)</i></span>);
        let showMenuIconButton = false;
        let clipboardDocked = true;
        let clipboardWidth = 450;

        let that = this;
        let contentItems = this.props.workspaceData.articles.map(function(content) {  
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
        let clearDisabled = true;
        if ((this.props.workspaceData.articles.length > 0) || this.props.workspaceData.title) {
            clearDisabled = false;
        }
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
                    workspaceContent={this.props.workspaceData.articles}
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
                            <ToolbarTitle style={{color:colors.black, fontWeight: "bold", fontFamily:this.props.muiTheme.baseTheme.fontFamily}} 
                                text={this.props.workspaceData.title? this.props.workspaceData.title : "Untitled Workspace"}/>
                        </ToolbarGroup>
                    </Toolbar>
                    <Toolbar> 
                        <ToolbarGroup>
                            <RaisedButton primary={true} onMouseUp={this.showLoadWorkspace} label="Load Workspace"/>
                            <RaisedButton primary={true} onMouseUp={this.showUpdateWorkspace} disabled={this.props.workspaceData.id == null} label="Update and Save Workspace"/>
                            <RaisedButton primary={true} onMouseUp={this.showCreateWorkspace} label="Save New Workspace"/>
                            <RaisedButton primary={true} onMouseUp={this.unSelectAll} label="Clear Workspace" disabled={clearDisabled}/>
                            <RaisedButton primary={true} label="Find Similar" onMouseUp={this.onFindSimilarMultiple} disabled={disabled}/>
                        </ToolbarGroup>
                    </Toolbar>
                    <WorkspaceChooser visible={this.state.workspaceChooserVisible} 
                        onChooseWorkspace={this.chooseWorkspace}
                        onCancel={this.cancelChooseWorkspace}
                        workspacesOnServer={this.state.workspacesOnServer}/>
                    <WorkspaceEditor visible={this.state.workspaceEditorVisible} 
                        isCreating={this.state.workspaceEditorCreating}
                        onSubmitWorkspace={this.submitWorkspace}
                        onCancel={this.cancelWorkspaceEditor}
                        workspaceData={this.props.workspaceData}/>
                    {contentItems}
                </div>
                <Snackbar
                    style={{fontFamily: this.props.muiTheme.baseTheme.fontFamily, textAlign: "center"}}
                    open={this.props.snackbar.open}
                    message={this.props.snackbar.message}
                    autoHideDuration={2000}
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
        workspaceData: state.workspaceData,
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
        onRedo: () => dispatch(UndoActionCreators.redo()),
        onLoadWorkspace: (workspaceId) =>  dispatch(loadWorkspace(workspaceId)),
        onGetWorkspaces: () => getWorkspaces(), // Yes, this is kind of silly
        onCreateWorkspace: (workspaceData) => dispatch(createWorkspace(workspaceData)),
        onUpdateWorkspace: (workspaceData) => dispatch(updateWorkspace(workspaceData))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(muiThemeable()(Master));
