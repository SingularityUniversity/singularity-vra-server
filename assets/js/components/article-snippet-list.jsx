import React from 'react';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import ArticleSnippets from './article-snippets';


const propTypes = {
  articleSnippets: React.PropTypes.array.isRequired
};

const ArticleSnippetList = React.createClass({
  propTypes: propTypes,

  articleSnippets() {
    return this.props.articleSnippets.map((article) => {
      return (
       <div>
          <ArticleSnippets 
            id={article.id}
            title={article.title} 
            snippets={article.snippets} />
          <Divider />
        </div>
      );
    }); 
  },

  render() {
    return (
      <List>
        { this.articleSnippets() }
      </List>
    );
  }
});

export default ArticleSnippetList
