import React from 'react';
import Drawer from 'material-ui/Drawer';
import Moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {closeClipboard} from '../actions/clipboard-actions';
import { store } from '../configure-store';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import ArticleSnippetList from './article-snippet-list'


const propTypes = {
    docked: React.PropTypes.bool.isRequired,
    open: React.PropTypes.bool.isRequired,
    style: React.PropTypes.object,
    muiTheme: React.PropTypes.object.isRequired,
    articleSnippetList: React.PropTypes.array.isRequired,
  };

const Clipboard = React.createClass({
  propTypes: propTypes, 

  render() {
    const {
      docked,
      open,
      openSecondary,
      width,
      articleSnippetList,
    } = this.props;

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
          <IconButton tooltip='Copy to system clipboard'>
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
