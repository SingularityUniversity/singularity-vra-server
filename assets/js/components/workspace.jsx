import React from 'react';
import ReactDOM from 'react-dom';

import muiThemeable from 'material-ui/styles/muiThemeable';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import {Card, CardTitle, CardText}  from 'material-ui/Card';
import {colors} from 'material-ui/styles';
import RaisedButton from 'material-ui/RaisedButton';

import WorkspaceChooser from '../components/workspace-chooser';
import WorkspaceEditor from '../components/workspace-editor';
import ContentDetail from '../components/content-detail';


export class _Workspace extends React.Component {

    componentDidUpdate(prevProps, prevState) { // eslint-disable-line no-unused-vars
        if ((prevProps.workspaceData.articles.length) < (this.props.workspaceData.articles.length)) {
            if (this._lastContent) {
                let domNode = ReactDOM.findDOMNode(this._lastContent);
                domNode.scrollIntoView();
            }
        }
    }

    render() {
        const styles = this.props.muiTheme;
        const that = this;
        let contentItems = this.props.workspaceData.articles.map(function(content, index, array) {
            if (index == array.length - 1) {
                return (
                    <ContentDetail ref={(c) => that._lastContent = c} isPreview={false} key={content.pk} style={styles.fullWidthSection} content={content} onAction={(content, action, params) => that.props.handleContentAction(content, action, params)}/>
                );
            } else {
                return (
                    <ContentDetail isPreview={false} key={content.pk} style={styles.fullWidthSection} content={content} onAction={(content, action, params) => that.props.handleContentAction(content, action, params)}/>
                );
            }
        });
        let disabled=false;
        if (contentItems.length == 0) {
            contentItems = [
                (<Card key={"empty"}>
                    <CardText>
                        <h2>Getting Started</h2>
                        <p>
                            Your workspace is empty. You have two ways to get started:
                        </p>
                        <ol>
                            <li>Load a workspace that has been previously saved</li>
                            <li>Conduct a search using the search field in the upper right hand corner</li>
                        </ol>

                        <p>
                            Please note that once you put items in your workspace (from search results), you should save your workspace, including giving it a name and a description. You will need to save it again after any changes you make to it. 
                        </p>
                        <p>
                            You may show most recent search results using the '&gt;' symbol on the left, and you may show the clipboard using the '&lt;' symbol on the right.
                        </p>
                        <p>
                            The VRA clipboard can be used to collect snippets from content in the workspace. When you highlight content in an item in the workspace, you can save the snippet for viewing in the VRA clipboard. Additionally, the content of the VRA clipboard can be copied to the system clipboard for pasting into other applications.
                        </p>


                    </CardText>
                
                    </Card>)
            ];
            disabled=true;
        }

        let clearDisabled = true;
        if ((this.props.workspaceData.articles.length > 0) || this.props.workspaceData.title) {
            clearDisabled = false;
        }
        const itemCount = (<ToolbarTitle style={{color: colors.grey500, fontFamily: this.props.muiTheme.baseTheme.fontFamily, fontStyle: "italic"}} text={`${this.props.workspaceData.articles.length} item(s)`}/> );
        let dirty = this.props.workspaceData.dirty ? (<ToolbarTitle style={{color: colors.grey500, fontFamily: this.props.muiTheme.baseTheme.fontFamily, fontStyle: "italic"}} text="Unsaved"/>) : "";

        return (
            <div style={styles.fullWidthSection.root}>
                <Toolbar>
                    <ToolbarGroup>
                        <ToolbarTitle style={{color:colors.black, fontWeight: "bold", fontFamily:this.props.muiTheme.baseTheme.fontFamily}}
                            text={this.props.workspaceData.title? this.props.workspaceData.title : "Untitled Workspace"}/><br/>
                        {itemCount} {dirty}
                    </ToolbarGroup>
                </Toolbar>
                <Toolbar>
                    <ToolbarGroup>
                        <RaisedButton primary={true} onMouseUp={this.props.showLoadWorkspace} label="Load/Manage"/>
                        <RaisedButton primary={true} onMouseUp={this.props.showUpdateWorkspace} disabled={this.props.workspaceData.id == null} label="Update and Save"/>
                        <RaisedButton primary={true} onMouseUp={this.props.showCreateWorkspace} label="Save New"/>
                        <RaisedButton primary={true} onMouseUp={this.props.unSelectAll} label="Clear" disabled={clearDisabled}/>
                        <RaisedButton primary={true} label="Find Similar" onMouseUp={this.props.findSimilarMultiple} disabled={disabled}/>
                    </ToolbarGroup>
                </Toolbar>
                <WorkspaceChooser visible={this.props.workspaceChooserVisible}
                    onChooseWorkspace={this.props.chooseWorkspace}
                    onCancel={this.props.cancelChooseWorkspace}
                    onDeleteWorkspace={this.props.deleteWorkspace}
                    workspacesOnServer={this.props.workspacesOnServer}/>
                <WorkspaceEditor visible={this.props.workspaceEditorVisible}
                    isCreating={this.props.workspaceEditorCreating}
                    onSubmitWorkspace={this.props.submitWorkspace}
                    onCancel={this.props.cancelWorkspaceEditor}
                    workspaceData={this.props.workspaceData}/>
                {contentItems}
            </div>

        )
    }

}

_Workspace.propTypes = {
    chooseWorkspace: React.PropTypes.func.isRequired,
    deleteWorkspace: React.PropTypes.func.isRequired,
    workspacesOnServer: React.PropTypes.array.isRequired,
    submitWorkspace: React.PropTypes.func.isRequired,
    workspaceData: React.PropTypes.object.isRequired,
    showLoadWorkspace: React.PropTypes.func.isRequired,
    showUpdateWorkspace: React.PropTypes.func.isRequired,
    showCreateWorkspace: React.PropTypes.func.isRequired,
    unSelectAll: React.PropTypes.func.isRequired,
    cancelChooseWorkspace: React.PropTypes.func.isRequired,
    findSimilarMultiple: React.PropTypes.func.isRequired,
    workspaceChooserVisible: React.PropTypes.bool.isRequired,
    workspaceEditorVisible: React.PropTypes.bool.isRequired,
    workspaceEditorCreating: React.PropTypes.bool.isRequired,
    handleContentAction: React.PropTypes.func.isRequired // XXX: add testing for this
}

export default muiThemeable()(_Workspace);
