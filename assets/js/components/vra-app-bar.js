import React from 'react';
import FlatButton from 'material-ui/lib/flat-button';
import IconButton from 'material-ui/lib/icon-button';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import MenuItem from 'material-ui/lib/menus/menu-item';
import AppBar from 'material-ui/lib/app-bar';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group'
import TextField from 'material-ui/lib/text-field';


//const VraAppBar = () => (
export default React.createClass({
  handleTouchTap(e) {
  },

  render() {
    return (
      <AppBar
        title = "Virtual Research Assistant"
        showMenuIconButton = {true}
        onLeftIconButtonTouchTap = {this.handleTouchTap}
        iconElementRight = {
          <IconMenu
            iconButtonElement={
              <IconButton><MoreVertIcon /></IconButton>
            }
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          anchorOrigin={{horizontal: 'right', vertical: 'top'}} >
            <MenuItem primaryText="Add RSS feed" />
            <MenuItem primaryText="Add Web page" />
            </IconMenu>
        } >
        <TextField
        hintText = "Enter search terms"
        style = {{
          color: 'white',
        }} />
      </AppBar>
    );
  }
});

//export default VraAppBar

