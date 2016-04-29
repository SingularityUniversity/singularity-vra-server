import React from 'react';
import $ from 'jquery';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';
import IconButton from 'material-ui/lib/icon-button';
import ActionCached from 'material-ui/lib/svg-icons/action/cached';
import ReactPaginate from 'react-paginate';
import VraContentList from './vra-content-list';


var VraContentBox = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      offset: 0
    };
  },

  loadObjectsFromServer: function() {
    $.ajax({
      url: `${this.props.url}`,
      data: {limit: this.props.perPage, offset: this.state.offset},
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data['results'], pageNum: (data.count/this.props.perPage)});
      }.bind(this),
      error: function(xhr, status, err) {
        // XXX: display error popup or something here
        console.log(xhr, status);
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadObjectsFromServer();
  },

  handlePageClick: function(data) {
    this.setState({offset: Math.ceil(data.selected * this.props.perPage)});
    this.loadObjectsFromServer();
  },

  render: function() {
    return (
      <div>
        <Toolbar>
          <ToolbarGroup float='left'>
            <ToolbarTitle text='Articles' />
          </ToolbarGroup>
          <ToolbarGroup float='right'>
            <IconButton tooltip='Reload articles'>
              <ActionCached />
            </IconButton>
          </ToolbarGroup>
        </Toolbar>
        <VraContentList data={this.state.data} />
        <nav id='content-pagination'>
          <ReactPaginate clickCallback={this.handlePageClick}
                         previousLabel={<span class="prev">Previous</span>}
                         nextLabel={<span class="prev">Next</span>}
                         breakLabel={<span class="ellipsis">...</span>}
                         pageNum={this.state.pageNum}
                         marginPagesDisplayed={2}
                         pageRangeDisplayed={5} />
        </nav>
      </div>
    );
  }
});

export default VraContentBox;
