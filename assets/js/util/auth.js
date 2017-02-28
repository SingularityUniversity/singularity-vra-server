import $ from 'jquery'

module.exports = {
    register: function(username, email, password, cb) {
        $.ajax({
            type: 'POST',
            url: '/api/v1/user/',
            data: {
                username: username,
                email: email,
                password: password
            },
            success: function(res){
                module.exports.login(username, password, cb);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                let text = '';
                for (let key in jqXHR.responseJSON) {
                    text += '\u25cf ' + jqXHR.responseJSON[key] + '\n';
                }
                alert(text);
            }
        });
    },

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
    
    logout: function(cb) {
        delete localStorage.token
        if (cb) cb(true)
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
