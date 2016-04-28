import React from 'react';
import $ from 'jquery';
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
        <h1>Articles</h1>
        <VraContentList data={this.state.data} />
      </div>
    );
  }
});

export default VraContentBox;
