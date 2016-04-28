import React from 'react';
import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';
import Moment from 'moment';


var VraContentList = React.createClass({
  render: function() {
    var contentRows = this.props.data.map(content => {
      const created = Moment(content.created).format('YYYY-MM-DD HH:mm')
      return (
        <TableRow>
          <TableRowColumn>{content.extract['title']}</TableRowColumn>
          <TableRowColumn>{created}</TableRowColumn>
        </TableRow>

      );
    });
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderColumn>Article</TableHeaderColumn>
              <TableHeaderColumn>Processed At</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contentRows}
          </TableBody>
        </Table>
      </div>
    );
  }
});

export default VraContentList;
