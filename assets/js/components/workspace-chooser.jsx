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
export class _WorkspaceChooser extends React.Component {
    constructor(props) {
        super(props);
        this.state={open:false};
    }

    toggleState() {
        this.setState({open: !this.state.open})
    }

    requestClose() {
        console.log("Request close was called!");
        this.setState({open: false});
        this.props.onCancel();
    }

    componentWillReceiveProps(newProps) {
        if ((newProps.visible)  && (!this.props.visible)) {
            this.setState({open: true});
        } else if (!newProps.visible) {
            this.setState({open: false});
        }
    }

    render() {
        const actions=[
            (<RaisedButton  label="Cancel" primary={true} onTouchTap={() =>{this.requestClose()}} />)
        ];
        return (
            <Dialog ref="dialog" className="workspaceChooser" actions={actions} title="Workspaces" open={this.state.open}  modal={false} onRequestClose={() => this.requestClose()} autoScrollBodyContent={true}>
                <WorkspaceList workspacesOnServer={this.props.workspacesOnServer} onCancel={() => this.requestClose()}
                    onChooseWorkspace={this.props.onChooseWorkspace}
                    onDeleteWorkspace={this.props.onDeleteWorkspace}
                />
            </Dialog>
        )
    }
}

export default connect(null, null)(muiThemeable()(_WorkspaceChooser));

