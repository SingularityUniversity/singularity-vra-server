import React from 'react';
import { findDOMNode } from 'react-dom';
import Drawer from 'material-ui/Drawer';
import Moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import ContentClear from 'material-ui/svg-icons/content/clear';
import ArticleSnippetList from './article-snippet-list';
import ClipboardCopy from 'clipboard';
import ClipboardVisibilityButton from '../components/clipboard-visibility-button';


const propTypes = {
    docked: React.PropTypes.bool.isRequired,
    open: React.PropTypes.bool.isRequired,
    style: React.PropTypes.object,
    muiTheme: React.PropTypes.object.isRequired,
    articleSnippetList: React.PropTypes.array.isRequired,
    onClear: React.PropTypes.func.isRequired
}

class Clipboard extends React.Component {

    componentDidMount() {
        new ClipboardCopy(findDOMNode(this.refs.clipboard_button));
    }

    render() {
        const {
            docked,
            open,
            openSecondary,
            width,
            articleSnippetList,
            onClear
        } = this.props;

        let clipboardText = '';
        if (articleSnippetList.length > 0) {
            let clipboardItems= articleSnippetList.map((article) => {
                let publishedDate = article.content.fields.published;
                let published = "Unknown";
                if (publishedDate) {
                    published = Moment(parseInt(publishedDate)).format('YYYY-MM-DD');
                }
                return article.content.fields.extract.title + '\n' +
                    article.content.fields.url+'\n'+
                    'Retrieved on: '+Moment(article.content.fields.created).format('YYYY-MM-DD')+'\n'+
                    'Published on: '+published+'\n\n'+
                    article.snippets.join('\n');
            });
            clipboardText=clipboardItems.join("\n\n---------------\n\n");
        }

        const style = {...this.props.muiTheme.leftNav, overflow: "visible"};
        const showButtons = (articleSnippetList.length > 0);
        return (
            <div>
                <div style={{
                    position: "fixed",
                    right: 0,
                    top: "50%"
                }}>
                    <ClipboardVisibilityButton
                        onClick={this.props.onClipboardVisibilityClick}
                        open={this.props.open} 
                        tooltipPosition="bottom-left"/>
                </div>
            <Drawer
                containerStyle={style}
                docked={docked}
                open={open}
                openSecondary={openSecondary}
                width={width}
                >
                <div style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    zIndex: 9999
                }}>
                    <ClipboardVisibilityButton
                        onClick={this.props.onClipboardVisibilityClick}
                        open={this.props.open}
                        tooltipPosition="bottom-center"/>
                </div>
                <div style={{paddingLeft: '10px', paddingBottom: '10px'}}>
                    <b>Clipboard</b>
                    <IconButton
                        ref='clipboard_button'
                        tooltip={showButtons ? 'Copy to system clipboard' : ''}
                        disabled={!showButtons}
                        data-clipboard-text={clipboardText}>
                        <ContentCopy />
                    </IconButton>
                    <IconButton
                        ref='clipboard_clear_button'
                        tooltip={showButtons ? 'Clear clipboard' : ''}
                        disabled={!showButtons}
                        onClick={onClear}>
                        <ContentClear />
                    </IconButton>
                </div>
                <Divider />
                <ArticleSnippetList articleSnippets={articleSnippetList}/>
            </Drawer>
        </div>
        );
    }
}

Clipboard.propTypes = propTypes;

export default muiThemeable()(Clipboard);
