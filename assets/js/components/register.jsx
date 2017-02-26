let React = require('react')
let auth = require('../util/auth')

module.exports = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },

    handleSubmit: function(e) {
        e.preventDefault();

        let username = this.refs.username.value;
        let email = this.refs.email.value;
        let pass = this.refs.pass.value;

        auth.register(username, email, pass, (loggedIn) => {
            if (loggedIn) {
                this.context.router.replace('/app/');
            }
        })
    },
    
    render: function() {
        return (
            <div style={{textAlign: "center"}}>
                <h3>Singularity University</h3>
                <h2>Virtual Research Assistant</h2>
                <p>
                    <b>Account Registration</b>
                </p>
                <form onSubmit={this.handleSubmit}>
                    <input type="text" placeholder="username" ref="username" /><br />
                    <input type="text" placeholder="email" ref="email" /><br />
                    <input type="password" placeholder="password" ref="pass" /><br />
                    <input type="submit" />
                </form>
            </div>
        )    
    }
})


