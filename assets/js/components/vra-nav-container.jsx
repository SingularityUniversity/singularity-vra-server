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
import LeftNav from 'material-ui/lib/left-nav';
import RaisedButton from 'material-ui/lib/raised-button';

export default React.createClass({
  _handleTouchTap(e) {
    this.leftNavOpenState = !this.leftNavOpenState;
    console.log(this.refs);
    this.refs.leftNav.setState({open: this.leftNavOpenState});
  },

  _articlesTouchTap(e) {
    console.log('articles ');
    ReactDOM.render(RaisedButton, document.getElementById('content'));
  },

  _sourcesTouchTap(e) {
    console.log('sources ', e);
  },

  _publishersTouchTap(e) {
    console.log('publishers ', e);
  },

  render() {
    return (
      <div>
        <AppBar
          title = "Virtual Research Assistant"
          showMenuIconButton = {false}
          //style={{position: 'fixed'}}
          iconElementRight = {
            <IconMenu
              iconButtonElement={
                <IconButton><MoreVertIcon /></IconButton>
              }
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
            anchorOrigin={{horizontal: 'right', vertical: 'top'}} >
              <MenuItem primaryText="Menu item 1" />
              <MenuItem primaryText="Menu item 2" />
              </IconMenu>
          } >
        </AppBar>
        <LeftNav
          ref='leftNav'
          style={{'top': '120px'}}
          open={true}
          docked={true} >
            <MenuItem onTouchTap={this._articlesTouchTap}>Articles</MenuItem>
            <MenuItem onTouchTap={this._sourcesTouchTap}>Sources</MenuItem>
            <MenuItem onTouchTap={this._publishersTouchTap}>Publishers</MenuItem>
        </LeftNav>
        <div id='content'></div>
      </div>
    );
  }
});

