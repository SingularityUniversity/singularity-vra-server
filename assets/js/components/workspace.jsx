import React from 'react';

import muiThemeable from 'material-ui/styles/muiThemeable';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import {Card, CardTitle}  from 'material-ui/Card';
import {colors} from 'material-ui/styles';
import RaisedButton from 'material-ui/RaisedButton';

import WorkspaceChooser from '../components/workspace-chooser';
import WorkspaceEditor from '../components/workspace-editor';
import ContentDetail from '../components/content-detail';


export class _Workspace extends React.Component {

    render() {
        const styles = this.props.muiTheme;
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

        return (
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
    workspaceEditorCreating: React.PropTypes.bool.isRequired
}

export default muiThemeable()(_Workspace);