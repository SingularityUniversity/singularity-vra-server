import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import App from './app';
import Cookies from 'js-cookie';
import $ from 'jquery';


require("../css/style.scss");

// Needed for onTouchTap 
// http://stackoverflow.com/a/34015469/988941 
injectTapEventPlugin();

let csrftoken = Cookies.get('csrftoken');

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

let state = {hello: 1};

history.pushState(state, "App", "#app");

$(window).on('popstate', function (e) {
    console.log("Got popstate", e);
    var state = e.originalEvent.state;
    if (state !== null) {
        document.title = state.title;
        load(state.url);
    } else {
        alert("Please don't use the back button. You can see previous search results using the arrows near the search bar.");
        history.pushState(state, "App", "#app");
    }
});

render(<App/>, document.getElementById('app'))
