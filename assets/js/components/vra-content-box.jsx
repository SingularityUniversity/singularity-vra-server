import React from 'react';
import $ from 'jquery';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';
import IconButton from 'material-ui/lib/icon-button';
import ActionCached from 'material-ui/lib/svg-icons/action/cached'
import VraContentList from './vra-content-list';


var VraContentBox = React.createClass({
  getInitialState: function() {
    return {
      url: '/api/v1/content?page=1',
      data: []
    };
  },

  componentDidMount: function() {
    $.ajax({
      //url: this.props.url,
      url: '/api/v1/content?page=1',
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data['results']});
      }.bind(this),
      error: function(xhr, status, err) {
        // XXX: display error popup or something here
        console.log(xhr, status);
      }.bind(this)
    });
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
      </div>
    );
  }
});

export default VraContentBox;
