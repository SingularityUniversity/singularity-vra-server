import React from 'react';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import {Card, CardTitle}  from 'material-ui/Card';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {colors} from 'material-ui/styles';
import AppLeftNav from '../components/app-left-nav';
import Clipboard from '../components/clipboard';
import ContentDetail from '../components/content-detail';
import { addSnippetToClipboard, toggleClipboard, clearClipboard } from '../actions/clipboard-actions';
import { connect } from 'react-redux';
import Snackbar from 'material-ui/Snackbar';
import { similaritySearch, startKeywordSearch, keywordSearch, clearSearch, addSearchResults } from '../actions/search-actions';
import { createWorkspace, updateWorkspace, getWorkspaces, loadWorkspace, clearWorkspace, setInWorkspace, deleteWorkspace} from '../actions/workspace-actions';
import { getArticleCount } from '../actions/article-count-actions';
import { showSnackbarMessage, closeSnackbar} from '../actions/snackbar-actions';
import { ActionCreators as UndoActionCreators } from 'redux-undo'
import RaisedButton from 'material-ui/RaisedButton';
import WorkspaceChooser from '../components/workspace-chooser';
import WorkspaceEditor from '../components/workspace-editor';
import AppMenuBar from '../components/app-menu-bar';

class Master extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            initialSearchText: '', // The initial text to set the search input to
            workspaceChooserVisible: false,
            workspaceEditorVisible: false,
            workspaceEditorCreating: false,
            workspacesOnServer: []
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.searchData.searchText != nextProps.searchData.searchText) {
            this.setState({initialSearchText: nextProps.searchData.searchText});
        }
    }

    componentDidMount() {
        this.props.onGetArticleCount();
    }

    handleSelectedForWorkspace(content, inWorkspace) {
        this.props.onSetInWorkspace(content, inWorkspace);
    }

    handleContentAction(content, action, params) {  // eslint-disable-line no-unused-vars
        if (action=="similar") {
            this.clearSearch();
            this.props.onSimilaritySearch([content.pk]);
        }
    }

    onFindSimilarMultiple() {
        this.clearSearch();
        this.props.onSimilaritySearch(this.props.workspaceData.articles.map((content) => {
            return content.pk;
        }));
    }

    doSearch(searchText) {
        this.props.onStartKeywordSearch(searchText);
        this.props.onKeywordSearch(searchText, 0);
    }

    clearSearch() {
        this.setState({initialSearchText: ""});
        this.props.onClearSearch();
    }

    unSelectAll() {
        this.props.onClearWorkspace();
    }

    showLoadWorkspace() {
        this.props.onGetWorkspaces()
            .then(workspaceList =>
                this.setState( { workspacesOnServer: workspaceList, workspaceChooserVisible: true }))
            .catch(error => {
                this.props.onShowSnackbarMessage("There was an error getting list of workspaces:"  +  error);
            });
    }

    chooseWorkspace(workspaceId) {
        this.props.onLoadWorkspace(workspaceId).
            then(() => this.setState({workspaceChooserVisible: false})).
            catch(error => this.props.onShowSnackbarMessage("There was an error loading workspace: "+error));
    }

    deleteWorkspace(workspaceId) {
        this.props.onDeleteWorkspace(workspaceId)
            .then(() => {
                if (this.props.workspaceData.id == workspaceId) {
                    this.props.onClearWorkspace();
                }
                this.setState({
                    workspacesOnServer: this.state.workspacesOnServer.filter(x => x.id != workspaceId)
                });
            })
            .catch(error => this.props.onShowSnackbarMessage("There was an error deleting workspace: "+error));
    }

    showUpdateWorkspace() {
        this.setState({
            workspaceEditorVisible: true,
            workspaceEditorCreating: false
        });
    }

    showCreateWorkspace() {
        this.setState({
            workspaceEditorVisible: true,
            workspaceEditorCreating: true
        });
    }

    cancelWorkspaceEditor() {
        this.setState({
            workspaceEditorVisible: false
        });
    }

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
    }

    cancelChooseWorkspace() {
        this.setState({workspaceChooserVisible: false});
    }

    render() {
        let styles = this.props.muiTheme;

        let clipboardDocked = true;
        let clipboardWidth = 450;

        let contentItems = this.props.workspaceData.articles.map(function(content) {
            return (
                <ContentDetail isPreview={false} key={content.pk} style={styles.fullWidthSection} content={content} onAction={() => this.handleContentAction()}/>
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
        let dirty = this.props.workspaceData.dirty ? (<ToolbarTitle style={{color: colors.grey500, fontFamily: this.props.muiTheme.baseTheme.fontFamily, fontStyle: "italic"}} text="Unsaved"/>) : "";
        // XXX: This is really hacky - there are styles from the theme that we're setting in the theme.js
        // but then we are extracting them from the theme and passing in the containerStyle and style, because
        // I haven't figured out exactly  how to structure the entries in theme.js
        // XXX: Also a hack in the snackbar to force fontFamily - this may be a bug in material-ui
        return (
            <div style={styles.root}>
                <AppMenuBar
                    articleCount = {this.props.articleCount}
                    canUndoSearch = {this.props.canUndoSearch}
                    canRedoSearch = {this.props.canRedoSearch}
                    onUndo = {this.props.onUndo}
                    onRedo = {this.props.onRedo}
                    doSearch = {(searchText) => this.doSearch(searchText)}
                    initialSearchText = {this.state.initialSearchText}
                    onClipboardVisibilityClick = {this.props.onClipboardVisibilityClick}
                    clipboardVisibility = {this.props.clipboardVisibilty}
                />
                <AppLeftNav
                    onChangeSelected={(content, selected) => this.handleSelectedForWorkspace(content, selected)}
                    displayedContent={this.props.searchData.searchResultData}
                    workspaceContent={this.props.workspaceData.articles}
                    totalCount={this.props.searchData.searchResultTotalCount}
                    searchType={this.props.searchData.searchType}
                    searchText={this.props.searchData.searchText}
                    loadItems={x => this.getItems(x)}
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
                                text={this.props.workspaceData.title? this.props.workspaceData.title : "Untitled Workspace"}/><br/>
                            {dirty}
                        </ToolbarGroup>
                    </Toolbar>
                    <Toolbar>
                        <ToolbarGroup>
                            <RaisedButton primary={true} onMouseUp={() => this.showLoadWorkspace()} label="Load/Manage"/>
                            <RaisedButton primary={true} onMouseUp={() => this.showUpdateWorkspace()} disabled={this.props.workspaceData.id == null} label="Update and Save"/>
                            <RaisedButton primary={true} onMouseUp={() => this.showCreateWorkspace()} label="Save New"/>
                            <RaisedButton primary={true} onMouseUp={() => this.unSelectAll()} label="Clear" disabled={clearDisabled}/>
                            <RaisedButton primary={true} label="Find Similar" onMouseUp={() => this.onFindSimilarMultiple()} disabled={disabled}/>
                        </ToolbarGroup>
                    </Toolbar>
                    <WorkspaceChooser visible={this.state.workspaceChooserVisible}
                        onChooseWorkspace={(id) => this.chooseWorkspace(id)}
                        onCancel={() => this.cancelChooseWorkspace()}
                        onDeleteWorkspace={(id) => this.deleteWorkspace(id)}
                        workspacesOnServer={this.state.workspacesOnServer}/>
                    <WorkspaceEditor visible={this.state.workspaceEditorVisible}
                        isCreating={this.state.workspaceEditorCreating}
                        onSubmitWorkspace={(id) => this.submitWorkspace(id)}
                        onCancel={() => this.cancelWorkspaceEditor()}
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
    }

    getItems({startIndex, stopIndex}) {
        // XXX: We are assuming we are getting more searchItems for paging, This is probably a bad assumption moving forward
        this.props.onKeywordSearch(this.props.searchData.searchText, startIndex, stopIndex-startIndex);
    }
}

Master.propTypes = {
    children: React.PropTypes.node,
    muiTheme: React.PropTypes.object.isRequired
};

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
        onDeleteWorkspace: (workspaceId) => dispatch(deleteWorkspace(workspaceId)),
        onGetWorkspaces: () => getWorkspaces(), // Yes, this is kind of silly
        onCreateWorkspace: (workspaceData) => dispatch(createWorkspace(workspaceData)),
        onUpdateWorkspace: (workspaceData) => dispatch(updateWorkspace(workspaceData))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(muiThemeable()(Master));
