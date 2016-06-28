import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Moment from 'moment';


export class WorkspaceEditorInternal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workspacesToLoad: []
        }
    }

    // onSubmit is always bound to the WorkspaceEditor instance. This was needed because it was being bound
    // to the RaisedButton its being used in below
    onSubmit = () => {
        let workspaceData = {
            articles: this.props.workspaceData.articles.slice(),
            title: this.titleField.getValue(),
            description: this.descriptionField.getValue()
        }
        if (!this.props.isCreating) {
            workspaceData.id = this.props.workspaceData.id;
        }
        this.props.onSubmitWorkspace(workspaceData);
    }


    render() {
        let workspaceData = {
            articles: this.props.workspaceData.articles.slice()
        }
        let action;
        if (this.props.isCreating) {
            workspaceData.title = this.props.workspaceData.title? `Copy of ${this.props.workspaceData.title}` :
                'New Workspace';
            workspaceData.description = this.props.workspaceData.description ? this.props.workspaceData.description :
                `Created at ${Moment().format('MMMM Do YYYY, h:mm:ss a')}`;
            action = "Create";
        } else {
            workspaceData.title = this.props.workspaceData.title;
            workspaceData.description = this.props.workspaceData.description;
            action = "Save";
        }
        const actions = [
            (<RaisedButton label={action} primary={true} onClick={this.onSubmit} />),
            (<RaisedButton label="Cancel" primary={true} onClick={this.props.onCancel} />)
        ];
        return (
            <Dialog title="Workspace" open={this.props.visible} actions={actions}  autoScrollBodyContent={true}>
                <TextField
                    fullWidth={true}
                    floatingLabelText="Title"
                    defaultValue={workspaceData.title}
                    ref={(field) => this.titleField = field}/>
                <br/>
                <TextField
                    multiLine={true}
                    fullWidth={true}
                    floatingLabelText="Description"
                    defaultValue={workspaceData.description}
                    ref={(field) => this.descriptionField = field}/>
            </Dialog>
        )
    }
}
export default connect(null, null)(muiThemeable()(WorkspaceEditorInternal));



