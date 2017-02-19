import $ from 'jquery'

module.exports = {
    login: function(username, pass, cb) {
        if (localStorage.token) {
            if (cb) cb(true)
            return
        }
        this.getToken(username, pass, (res) => {
            if (res.authenticated) {
                localStorage.token = res.token
                if (cb) cb(true)
            } else {
                if (cb) cb(false)
            }
        })
    },        
    
    logout: function() {
        delete localStorage.token
    },

    loggedIn: function() {
        return !!localStorage.token
    },

    getToken: function(username, pass, cb) {
        $.ajax({
            type: 'POST',
            url: '/obtain-auth-token',
            data: {
                username: username,
                password: pass
            },
            success: function(res){
                cb({
                    authenticated: true,
                    token: res.token
                })
            }
        })
    }, 
    getCSRFToken: function() {
        let name = 'csrftoken';
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = $.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}
