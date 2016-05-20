import React from 'react';
import Drawer from 'material-ui/Drawer';
import Moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableFooter, TableRow, TableRowColumn} from 'material-ui/Table';
import {closeClipboard} from '../actions/clipboard-actions';
import { store } from '../configure-store';


const propTypes = {
    docked: React.PropTypes.bool.isRequired,
    open: React.PropTypes.bool.isRequired,
    style: React.PropTypes.object,
    muiTheme: React.PropTypes.object.isRequired,
  };

const Clipboard = React.createClass({
  propTypes: propTypes, 

  render() {
    const {
      docked,
      open,
      openSecondary,
      width,
      snippetList,
    } = this.props;

    //let clipboardContent = snippetList.map((snippets, index, array) => {
    let clipboardContent = [].map((snippets, index, array) => {
    });

	const style = this.props.muiTheme.leftNav;
    return (
      <Drawer
        containerStyle={style}
        docked={docked}
        open={open}
        openSecondary={openSecondary}
        width={width}
      >
      <Table>
        <TableBody>
        </TableBody>
      </Table>
	  </Drawer>
    );
  },
});

export default muiThemeable()(Clipboard);
