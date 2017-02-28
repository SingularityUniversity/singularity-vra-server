import 'babel-polyfill';  // Needed to ensure Promise availble everywhere
import 'whatwg-fetch';
import React from 'react';
import {render} from 'react-dom';
import {Router, Route, browserHistory} from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin';
import App from './app';
import Login from './components/login'
import Register from './components/register'
import {loggedIn, getCSRFToken} from './util/auth'
import $ from 'jquery';

import "../css/style.scss";

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

let state = {hello: 1};

history.pushState(state, "App", "/app/");

$(window).on('popstate', function (e) {
    var state = e.originalEvent.state;
    if (state == null) {
        alert("Please don't use the back button. You can see previous search results using the arrows near the search bar.");
        history.pushState(state, "App", "/app/");
    }
});

let csrftoken = getCSRFToken();

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

function requireAuth(nextState, replace) {
    if (!loggedIn()) {
        replace({ 
            pathname:'/app/login/',
            state: {nextPathname: '/app/'}
        })
    }
}

render(
    <Router history={browserHistory}>
        <Route path='/app/login/' component={Login} />
        <Route path='/app/register/' component={Register} />
        <Route path='/app/' component={App} onEnter={requireAuth} />
        <Route path='/' component={App} onEnter={requireAuth} />
    </Router>,
    document.getElementById('app')
)
