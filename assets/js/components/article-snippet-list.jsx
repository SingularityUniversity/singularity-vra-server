import React from 'react';
import {List} from 'material-ui/List';
import ArticleSnippets from './article-snippets';


class ArticleSnippetList extends React.Component {
    articleSnippets() {
        return this.props.articleSnippets.map((article) => {
            return (
                <div key={article.content.pk}>
                    <ArticleSnippets 
                    content={article.content}
                    snippets={article.snippets} />
                </div>
            );
        }); 
    }

    render() {
        return (
            <List>
                { this.articleSnippets() }
            </List>
        );
    }
}

ArticleSnippetList.propTypes = {
    articleSnippets: React.PropTypes.array.isRequired
}

export default ArticleSnippetList
