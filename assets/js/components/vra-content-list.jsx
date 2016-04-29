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
    let contentRows = this.props.data.map(content => {
      let imageURL = ' ';
      let published = ' ';
      if (content.extract['published']) {
        published = Moment(parseInt(content.extract['published'])).format('YYYY-MM-DD HH:mm');
      }
      if (content.extract['images'] && content.extract['images'][0]) {
        imageURL =  content.extract['images'][0]['url'];
     }

      return (
        <TableRow>
          <TableRowColumn><div style={{width:'100px', height:'100px'}}><img src={imageURL} style={{width:'100%', height:'auto'}} /></div></TableRowColumn>
          <TableRowColumn>{content.extract['title']}</TableRowColumn>
          <TableRowColumn>{published}</TableRowColumn>
        </TableRow>

      );
    });
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderColumn></TableHeaderColumn>
              <TableHeaderColumn>Article</TableHeaderColumn>
              <TableHeaderColumn>Published Date</TableHeaderColumn>
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
