import React from 'react';
import { Provider } from 'react-redux';
import Master from './containers/master';
import MyRawTheme from './theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import configureStore, { initialState }  from './configure-store';

const store = configureStore(initialState);
const muiTheme = getMuiTheme(MyRawTheme);

// MuiThemeProvider surrounds the very top level and provides a new theme to everything below it
class App extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
        <Provider store={store} >
          <MuiThemeProvider muiTheme={muiTheme}>
              <Master />
          </MuiThemeProvider>
        </Provider>
    );
  }
}

export default App;
