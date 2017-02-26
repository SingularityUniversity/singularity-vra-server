import React from 'react';
//import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {logout} from '../util/auth'


class LogoutButton extends React.Component {
    static get contextTypes() {
        return {
            router: React.PropTypes.object.isRequired
        }
    }

    clickedLogout() {
        logout(() => {
            this.context.router.replace('/app/login/');
        });
    } 

    render() {
        return (
            <FlatButton 
                label='Logout'
                onClick={()=>this.clickedLogout()} />
        );
    }
}


export default muiThemeable()(LogoutButton);
