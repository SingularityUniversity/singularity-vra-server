import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import {List, ListItem} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';

class WorkspaceChooser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workspacesToLoad: []
        }
    }


    render() {
        let items = this.props.workspacesOnServer.map(item => {
            return ( 
                <ListItem key={item.id} primaryText={item.title} secondaryText={item.description} onClick={this.props.onChooseWorkspace.bind(null, item.id)}/>
            )
        });
        const actions=[
            (<RaisedButton  label="Cancel" primary={true} onTouchTap={this.props.onCancel} />)
        ];
        return (
            <Dialog actions={actions} title="Workspaces" open={this.props.visible}  autoScrollBodyContent={true}>
                <List>
                    {items}
                </List>
            </Dialog>
        );
    }
}

export default connect(null, null)(muiThemeable()(WorkspaceChooser));

