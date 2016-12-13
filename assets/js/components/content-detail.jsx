import React from 'react';
import {findDOMNode} from 'react-dom';
import Divider from 'material-ui/Divider';
import {Card, CardActions, CardHeader, CardText, CardTitle}  from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import {List, ListItem} from 'material-ui/List';
import muiThemeable from 'material-ui/styles/muiThemeable';
import SelectionMenu from 'selection-menu';
import TopicsList from './lda_topics';
import { connect } from 'react-redux';
import { showSearchResults, startKeywordSearch, keywordSearch } from '../actions/search-actions';
import { addSnippetToClipboard } from '../actions/clipboard-actions';
import { setInWorkspace } from '../actions/workspace-actions';
import IconButton from 'material-ui/IconButton';
import ContentRemoveCircle from 'material-ui/svg-icons/content/remove-circle';
import {colors} from 'material-ui/styles';
import { wordCountToTag, ariToGradeLevel, round } from '../util/readability';
import { authorListToString } from '../util/text';

import Moment from 'moment';

class ContentDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fullSummaries: false,
            selectedText: null
        };
    }

    clickedFindSimilar() {
        if (this.props.onAction) {
            this.props.onAction(this.props.content, 'similar');
        }
    }

    clickedMoreSummaries() {
        this.setState({fullSummaries: true});
    }

    clickedLessSummaries()  {
        this.setState({fullSummaries: false});
    }

    handleSelectionMenu(e, text) {
        if (e.target.id == 'clip-text') {
            this.props.onClip(
                    this.props.content,
                    text
                    );
        } else if (e.target.id == 'search-text') {
            this.props.onSearch(`"${text}"`);
        } else {
            console.error(`SelectionMenu: unknown action (${e.target.id})`);
        }
    }

    componentDidMount() {
        let that=this;
        new SelectionMenu({
            container: findDOMNode(this.refs.summary_section),
            content: '<div  class="selection-menu"> <ul> <li id="clip-text" class="shortcut" style="padding-left: .5em; padding-right: .5em">Clip&nbsp;Text</li> <li id="search-text" class="shortcut">Search</li> </ul> </div>',
            handler: function(e) {  // Not using es6 => because we want to bind to the SelectionMenu Object
                that.handleSelectionMenu(e, this.selectedText);
                this.hide(true);
            }
        });

        new SelectionMenu({
            container: findDOMNode(this.refs.quotes_section),
            content: '<div class="selection-menu"> <ul> <li id="clip-text" class="shortcut" style="padding-left: .5em; padding-right: .5em">Clip&nbsp;Text</li> <li id="search-text" class="shortcut">Search</li> </ul> </div>',
            handler: function(e) { // Not using es6 => because we want to bind to the SelectionMenu Object
                that.handleSelectionMenu(e, this.selectedText);
                this.hide(true);
            }
        });

        new SelectionMenu({
            container: findDOMNode(this.refs.content_section),
            content: '<div class="selection-menu"> <ul> <li id="clip-text" class="shortcut" style="padding-left: .5em; padding-right: .5em">Clip&nbsp;Text</li> <li id="search-text" class="shortcut">Search</li> </ul> </div>',
            handler: function(e) { // Not using es6 => because we want to bind to the SelectionMenu Object
                that.handleSelectionMenu(e, this.selectedText);
                this.hide(true);
            }
        });
    }

    removeFromWorkspace() {
        this.props.onSetInWorkspace(this.props.content, false);
    }

    render() {
        const {
            content,
            isPreview
        } = this.props;

        if (content ) {
            let fields = content.fields.article;
            let extract = fields.extract;
            let preProcessed = fields.pre_processed;
            let summarySentences = preProcessed ? preProcessed['summary_sentences'] : null;
            let quoteSentences = preProcessed ? preProcessed['quote_sentences'] : null;
            const readability = preProcessed ? preProcessed['readability'] : null;
            let readabilityLength = null;
            let readabilityARI = null;
            if (readability && readability['sentence_info']) {
                readabilityLength = readability['sentence_info']['words'];
                readabilityARI = readability['readability_grades']['ARI'];
            }
            let author = '';
            if (extract['authors'] && extract['authors'].length > 0) {
                author = authorListToString(extract['authors']);
                author += ' ';
            }

            let publishedDate = "Unknown";
            if (extract['published']) {
                publishedDate = Moment(parseInt(extract['published'])).
                    format('YYYY-MM-DD');
            }
            let addedDate = (content.fields['date_added']) ? 
                    Moment(content.fields['date_added']).format('YYYY-MM-DD') : '';
            var lda_stuff = null;
            if (content.lda_similarity_topics) {
                lda_stuff = (
                    <ListItem>
                        <Card>
                            <CardTitle
                                actAsExpander={true} showExpandableButton={true}
                                subtitleStyle={{textAlign: 'center'}}>
                                LDA-Inferred Topics - Similarity to Query Candidate is {content.score.toFixed(3)}
                            </CardTitle>
                            <CardText expandable={true}>
                                <TopicsList topics={content.lda_similarity_topics}/>
                            </CardText>
                        </Card>
                    </ListItem>
                )
            }
            let removeButton;
            let cardActions;
            if (isPreview) {
                removeButton="";
                cardActions="";
            }
            else{
                removeButton = (
                    <IconButton tooltip="Remove from workspace"  onClick={() => this.removeFromWorkspace()} ><ContentRemoveCircle color={colors.red500}/></IconButton>
                );
                cardActions = (
                    <CardActions expandable={true}>
                        <RaisedButton primary={true} onMouseUp={() => this.clickedFindSimilar()} label="Find similar documents"/>
                        <RaisedButton primary={true} label="Action2"/>
                    </CardActions>
                );
            }

            const title= (
                <span>
                    {extract.title} {removeButton}
                </span>);

            let moreOrLess = "";
            if ((summarySentences != null) && (summarySentences.length > 5)) {
                moreOrLess = this.state.fullSummaries ?
                (<a onClick={() => this.clickedLessSummaries()}>Less</a>) :
                (<a onClick={() => this.clickedMoreSummaries()}>More</a>);
            }
            const summaryContent = ((summarySentences != null) && (summarySentences.length > 0)) ?
                (<div>
                    {
                        summarySentences.slice(0,this.state.fullSummaries?10:5).map( val => {return(<li key={val}>{val}</li>)})
                    }
                    {moreOrLess}
                </div>
                ):
                "No content";

            const quoteContent = ((quoteSentences != null) && (quoteSentences.length > 0)) ?
                (<div>
                    {
                        quoteSentences.map( val => {return(<li key={val}>{val}</li>)})
                    }
                </div>
                ):
                "No content";


            const readabilityContent = readability ? (<pre>{JSON.stringify(readability, null, 2)}</pre>) : "No readability info";
            const itemsStyles = this.props.muiTheme.fullWidthSection.items;
            const itemComponentsStyles = itemsStyles.components;
            return (
                <Card initiallyExpanded={true} style={itemsStyles.style} containerStyle={itemsStyles.containerStyle}>
                    <CardTitle
                        showExpandableButton={true}
                        title={title}
                        subtitle={author}
                        titleStyle={{textAlign: 'center'}}
                        subtitleStyle={{textAlign: 'center'}}>
                    </CardTitle>
                    <CardText style={{padding: 0}} expandable={true}>
                        <List>
                            <ListItem><div>Publisher: {extract.provider_name} &nbsp;&nbsp;&nbsp; Published on:  {`${publishedDate}`}</div><div>Article Length: {wordCountToTag(readabilityLength)} &nbsp;&nbsp;&nbsp; ARI: {round(readabilityARI, 2)} ({ariToGradeLevel(readabilityARI)})</div><div>Added on: {addedDate}</div></ListItem>
                            <ListItem>URL: <a target="vra_preview" href={extract.url}>{extract.url}</a></ListItem>
                            <ListItem>
                                <Card style={itemComponentsStyles.style} containerStyle={itemComponentsStyles.containerStyle}>
                                    <CardTitle>Summary</CardTitle>
                                    <CardText ref='summary_section'>
                                        {summaryContent}
                                    </CardText>
                                </Card>
                            </ListItem>
                            <ListItem>
                                <Card style={itemComponentsStyles.style} containerStyle={itemComponentsStyles.containerStyle}>
                                    <CardTitle>Quotes</CardTitle>
                                    <CardText ref='quotes_section'>
                                        {quoteContent}
                                    </CardText>
                                </Card>
                            </ListItem>
                            {/* Comment out the readability card for the time being
                            <ListItem>
                                <Card style={itemComponentsStyles.style} containerStyle={itemComponentsStyles.containerStyle}>
                                    <CardTitle actAsExpander={true} showExpandableButton={true}>Readability Info</CardTitle>
                                    <CardText expandable={true}>
                                        {readabilityContent}
                                    </CardText>
                                </Card>
                            </ListItem>
                            {lda_stuff}
                            */}
                            <ListItem>
                                <Card style={itemComponentsStyles.style} containerStyle={itemComponentsStyles.containerStyle} ref='content_section'>
                                    <CardTitle actAsExpander={true} showExpandableButton={true}>Content</CardTitle>
                                    <CardText expandable={true}>
                                        <div dangerouslySetInnerHTML= {{__html: extract.content}}>
                                        </div>
                                    </CardText>
                                </Card>
                            </ListItem>
                        </List>
                    </CardText>
                    {cardActions}
                </Card>
            );
        } else {
            return (
                <Card>
                    <Divider/>
                    <CardHeader actAsExpander={true} showExpandableButton={true}/>
                    <CardTitle title="No content to show" subtitle="Select content"/>
                </Card>
            );
        }

    }
}

ContentDetail.propTypes = {
    isPreview: React.PropTypes.bool.isRequired,
    content: React.PropTypes.object,
    muiTheme: React.PropTypes.object.isRequired,
    onAction: React.PropTypes.func // onAction(content, action_id, params)
}

const mapDispatchToProps = (dispatch) => {
    return {
        onClip: (content, text) => {
            dispatch(addSnippetToClipboard(content, text));
        },
        onSearch: (text) => {
            dispatch(startKeywordSearch(text));
            dispatch(keywordSearch(text)).catch(() => {}); // We're displaying error, so don't do anything else
            dispatch(showSearchResults());
        },
        onSetInWorkspace: (content, inWorkspace) => {
            dispatch(setInWorkspace(content, inWorkspace));
        }
    };
}


export default connect(null, mapDispatchToProps)(muiThemeable()(ContentDetail));

