var React = require('react')
var auth = require('../util/auth')
import {Link} from 'react-router'


module.exports = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },

    handleSubmit: function(e) {
        e.preventDefault()

        var username = this.refs.username.value
        var pass = this.refs.pass.value

        auth.login(username, pass, (loggedIn) => {
            if (loggedIn) {
                this.context.router.replace('/app/')
            }
        })
    },
    
    render: function() {
        return (
            <div style={{textAlign: "center"}}>
                <h3>Singularity University</h3>
                <h2>Virtual Research Assistant</h2>
                <p>
                    <b>Login</b>
                </p>
                <form onSubmit={this.handleSubmit}>
                    <input type="text" placeholder="username" ref="username" /><br />
                    <input type="password" placeholder="password" ref="pass" /><br />
                    <br />
                    <input type="submit" />
                </form>
                <br />
                <Link to="/app/register/">Register</Link>
            </div>
        )    
    }
})
