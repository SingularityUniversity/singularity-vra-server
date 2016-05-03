import React from 'react';
import FlatButton from 'material-ui/lib/flat-button';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import {lightBlue300} from 'material-ui/lib/styles/colors';
import IconButton from 'material-ui/lib/icon-button';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group'

import VraNavContainer from './components/vra-nav-container';
import VraContentBox from './components/vra-content-box';

import Master from './components/master';

/*
const muiTheme = getMuiTheme({
  palette: {
    accent1Color: lightBlue300,
  },
});

*/
class App extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    var buttonStyle = {
      backgroundColor: 'white',
    };

    return (
      <div>
        <Master />
        {/*
        <VraNavContainer />
        <VraContentBox url={'/api/v1/content'} perPage={10}/>
        */}
      </div>
    );
  }

  handleClick(e) {
    console.log('click: ', e);
  }

  handleTouchTap(e) {
    console.log('touchTap: ', e);
  }
}

export default App;
