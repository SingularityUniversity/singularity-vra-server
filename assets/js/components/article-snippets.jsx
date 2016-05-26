import React from 'react';
import { ListItem } from 'material-ui/List/'
import { connect } from 'react-redux';
import { removeSnippetFromClipboard } from '../actions/clipboard-actions';
import IconButton from 'material-ui/IconButton';
import ContentRemoveCircle from 'material-ui/svg-icons/content/remove-circle';
import {colors} from 'material-ui/styles';
import muiThemeable from 'material-ui/styles/muiThemeable';

const mapDispatchToProps = (dispatch) => {
  return {
    onItemDeleted: (id, snippet_index) => {
      dispatch(removeSnippetFromClipboard(id, snippet_index));
    }
  };
}


const propTypes = {
  id: React.PropTypes.number.isRequired,
  title: React.PropTypes.string.isRequired,
  snippets: React.PropTypes.array.isRequired
};

const iconStyle= {
     width: 18,
    height: 18,
    padding:0
}
const buttonStyle= {
     width: 18,
    height: 18,
}

let ArticleSnippets = React.createClass({
  propTypes: propTypes,

  clickedRemove(index) {
      this.props.onItemDeleted(this.props.id, index);
  },
  snippets() {
    return this.props.snippets.map((snippet, index) => {
      return (
          <li key={snippet}>
          {snippet}<IconButton onClick={this.clickedRemove.bind(this, index)} style={buttonStyle} iconStyle={iconStyle} ><ContentRemoveCircle color={colors.red500}/></IconButton>
          </li>
      );
    });
  },

  render() {
    return (
      <ListItem key={this.props.id}>
        <div key={this.props.id}><b>{this.props.title}</b></div><br />
          <ul>
            { this.snippets() }
          </ul>
      </ListItem>
    );
  }
});

ArticleSnippets = connect(null, mapDispatchToProps)(muiThemeable()(ArticleSnippets));
export default ArticleSnippets; 
