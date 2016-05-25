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
          <li key={snippet}>{snippet}</li>
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

export default ArticleSnippets
