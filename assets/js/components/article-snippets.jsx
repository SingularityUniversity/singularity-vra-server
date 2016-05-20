import React from 'react';
import { ListItem } from 'material-ui/List/'

const propTypes = {
  title: React.PropTypes.string.isRequired,
  snippets: React.PropTypes.array.isRequired
};

const ArticleSnippets = React.createClass({
  propTypes: propTypes,

  snippets() {
    return this.props.snippets.map((snippet) => {
      return (
          <div>{snippet}<br /></div>
      );
    });
  },

  render() {
    return (
      <ListItem>
        <div><b>{this.props.title}</b></div><br />
        { this.snippets() }
      </ListItem>
    );
  }
});

export default ArticleSnippets
