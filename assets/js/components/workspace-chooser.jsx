import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import {List, ListItem} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import ContentRemoveCircle from 'material-ui/svg-icons/content/remove-circle';
import {colors} from 'material-ui/styles';

export class WorkspaceList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workspacesToLoad: []
        }
    }
    deleteWorkspace(workspaceId, evt) {
        evt.stopPropagation();
        this.props.onDeleteWorkspace(workspaceId);
    }
    render() {

        let items = this.props.workspacesOnServer.map(item => {
            const deleteButton=(
                <IconButton onClick={this.deleteWorkspace.bind(this, item.id)} ><ContentRemoveCircle color={colors.red500}/></IconButton>
            )
            return (
                <ListItem key={item.id} primaryText={item.title} secondaryText={item.description} onClick={this.props.onChooseWorkspace.bind(null, item.id)}
                    rightIconButton={deleteButton}/>
            )
        });
        return (
            <List>
                {items}
            </List>
        );
    }

}
export class WorkspaceChooser extends React.Component {

    render() {
        const actions=[
            (<RaisedButton  label="Cancel" primary={true} onTouchTap={this.props.onCancel} />)
        ];
        return (
            <Dialog actions={actions} title="Workspaces" open={this.props.visible}  autoScrollBodyContent={true}>
                <WorkspaceList workspacesOnServer={this.props.workspacesOnServer} onCancel={this.props.onCancel}
                    onChooseWorkspace={this.props.onChooseWorkspace}
                    onDeleteWorkspace={this.props.onDeleteWorkspace}
                />
            </Dialog>
        )
    }
}

export default connect(null, null)(muiThemeable()(WorkspaceChooser));

