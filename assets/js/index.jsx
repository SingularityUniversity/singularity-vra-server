import 'babel-polyfill';  // Needed to ensure Promise availble everywhere
import 'whatwg-fetch';
import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import App from './app';
import $ from 'jquery';

import "../css/style.scss";

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

let state = {hello: 1};

history.pushState(state, "App", "#app");

$(window).on('popstate', function (e) {
    var state = e.originalEvent.state;
    if (state == null) {
        alert("Please don't use the back button. You can see previous search results using the arrows near the search bar.");
        history.pushState(state, "App", "#app");
    }
});

render(<App/>, document.getElementById('app'))
