import React from 'react';
import { findDOMNode } from 'react-dom';
import Drawer from 'material-ui/Drawer';
import Moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {closeClipboard} from '../actions/clipboard-actions';
import { store } from '../configure-store';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import ArticleSnippetList from './article-snippet-list';
import ClipboardCopy from 'clipboard';


const propTypes = {
    docked: React.PropTypes.bool.isRequired,
    open: React.PropTypes.bool.isRequired,
    style: React.PropTypes.object,
    muiTheme: React.PropTypes.object.isRequired,
    articleSnippetList: React.PropTypes.array.isRequired,
  };

const Clipboard = React.createClass({
  propTypes: propTypes, 

  componentDidMount() {
    new ClipboardCopy(findDOMNode(this.refs.clipboard_button));
  },

  render() {
    const {
      docked,
      open,
      openSecondary,
      width,
      articleSnippetList,
    } = this.props;

    let clipboardText = '';
    if (articleSnippetList.length > 0) {
      clipboardText = articleSnippetList.reduce((previousValue, article) => {
        return previousValue + article.title + '\n\n' + article.snippets.join('\n') + '\n\n';
      }, '');
    } 

	const style = this.props.muiTheme.leftNav;
    return (
      <Drawer
        containerStyle={style}
        docked={docked}
        open={open}
        openSecondary={openSecondary}
        width={width}
      >
        <div style={{paddingLeft: '10px', paddingBottom: '10px'}}>
          <b>Clipboard</b>
          <IconButton 
            ref='clipboard_button' 
            tooltip='Copy to system clipboard'
            data-clipboard-text={clipboardText}>
            <ContentCopy />
          </IconButton>
        </div>
        <Divider />
        <ArticleSnippetList articleSnippets={articleSnippetList}/>
	  </Drawer>
    );
  },
});

export default muiThemeable()(Clipboard);
