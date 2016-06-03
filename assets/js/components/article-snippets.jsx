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
        onItemDeleted: (content, snippet_index) => {
            dispatch(removeSnippetFromClipboard(content, snippet_index));
        }
    };
}


const propTypes = {
    content: React.PropTypes.object.isRequired,
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
    padding: 0,
    marginLeft: 5,
    verticalAlign: "middle"
}

let ArticleSnippets = React.createClass({
    propTypes: propTypes,

    clickedRemove(index) {
        this.props.onItemDeleted(this.props.content, index);
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
            <ListItem key={this.props.content.pk}>
                <div key={this.props.content.pk}><b>{this.props.content.fields.extract.title}</b></div>
                <ul style={{marginTop:5}}>
                { this.snippets() }
                </ul>
            </ListItem>
        );
    }
});

ArticleSnippets = connect(null, mapDispatchToProps)(muiThemeable()(ArticleSnippets));
export default ArticleSnippets; 
