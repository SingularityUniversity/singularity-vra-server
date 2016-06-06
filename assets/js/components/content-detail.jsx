import $ from 'jquery';
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
import { startKeywordSearch, keywordSearch } from '../actions/search-actions';
import { addSnippetToClipboard } from '../actions/clipboard-actions';
import { setInWorkspace } from '../actions/workspace-actions';
import IconButton from 'material-ui/IconButton';
import ContentRemoveCircle from 'material-ui/svg-icons/content/remove-circle';
import {colors} from 'material-ui/styles';

import Moment from 'moment';

const ContentDetail = React.createClass({

    propTypes: {
        content: React.PropTypes.object,
        muiTheme: React.PropTypes.object.isRequired,
        onAction: React.PropTypes.func.isRequired  // onAction(content, action_id, params)
    }, 
    getInitialState() {
        return {
            summaries: [],
            selectedText: null
        };
    },
    clickedFindSimilar() {
        if (this.props.onAction) {
            this.props.onAction(this.props.content, 'similar');
        }
    },

    handleSelectionMenu(e, text) {
        if (e.target.id == 'clip-text') {
            this.props.onClip(
                    this.props.content,
                    text
                    );
        } else if (e.target.id == 'search-text') {
            this.props.onSearch(text);

        } else {
            console.error(`SelectionMenu: unknown action (${e.target.id})`);
        }
    },

    componentDidMount() {
        let that=this;
        new SelectionMenu({
            container: findDOMNode(this.refs.summary_section),
            content: '<div  class="selection-menu"> <ul> <li id="clip-text" class="shortcut" style="padding-left: .5em; padding-right: .5em">Clip&nbsp;Text</li> <li id="search-text" class="shortcut">Search</li> </ul> </div>',
            handler: function(e) {
                that.handleSelectionMenu(e, this.selectedText);
                this.hide(true);
            }
        });

        new SelectionMenu({
            container: findDOMNode(this.refs.content_section),
            content: '<div class="selection-menu"> <ul> <li id="clip-text" class="shortcut" style="padding-left: .5em; padding-right: .5em">Clip&nbsp;Text</li> <li id="search-text" class="shortcut">Search</li> </ul> </div>',
            handler: function(e) {
                that.handleSelectionMenu(e, this.selectedText);
                this.hide(true);
            }
        });

        $.ajax({
            url: `/api/v1/content/${this.props.content.pk}/summary`,
            success: (data) => {
                this.setState({summaries: data.summary});
            },
            error: (xhr, status, err) => {  // eslint-disable-line no-unused-vars 
                console.error(xhr, status);
            }
        });
    },
    removeFromWorkspace() {
        this.props.onSetInWorkspace(this.props.content, false);
    },
    render() {
        const {
            content
        } = this.props;

        if (content ) {
            let fields = content.fields;
            let extract = fields.extract;
            let publishedDate = "Unknown";
            if (extract['published']) {
                publishedDate = Moment(parseInt(extract['published'])).
                    format('YYYY-MM-DD');
            }
            var lda_stuff = null;
            if (content.lda_similarity_topics) {
                lda_stuff = (
                    <ListItem>	
                        LDA-Inferred Topics - Similarity to Query Candidate is {content.score.toFixed(3)}
                        <Card>
                            <CardTitle 
                                actAsExpander={true} showExpandableButton={true} 
                                subtitleStyle={{textAlign: 'center'}}/> 
                            <CardText expandable={true}>
                                <TopicsList topics={content.lda_similarity_topics}/>
                            </CardText>
                        </Card>
                    </ListItem>
                )
            } 
            let title= (
                <span>
                    {extract.title}
                    <IconButton onClick={this.removeFromWorkspace} ><ContentRemoveCircle color={colors.red500}/></IconButton>
                </span>);

            return (
                <Card initiallyExpanded={true} containerStyle={this.props.muiTheme.fullWidthSection.item}>
                    <CardTitle 
                        showExpandableButton={true}
                        title={title} 
                        subtitle={"From: "+extract.provider_name}
                        titleStyle={{textAlign: 'center'}}
                        subtitleStyle={{textAlign: 'center'}}>
                    </CardTitle>
                    <CardText expandable={true}>
                        <List>
                            <ListItem>Published on:  {`${publishedDate}`} </ListItem>
                            <ListItem>URL: <a target="vra_preview" href={extract.url}>{extract.url}</a></ListItem>
                            <ListItem>
                                Summary:
                                <Card>
                                    <CardText ref='summary_section'>
                                    {
                                        (this.state.summaries.length ==0 ) ? "No content" :
                                            this.state.summaries.map(function(val) {
                                                return (<li key={val}>{val}</li>);
                                            })
                                    }
                                    </CardText>
                                </Card>
                            </ListItem>
                            {lda_stuff}
                            <ListItem>
                                Content:
                                <Card ref='content_section'>
                                    <CardTitle actAsExpander={true} showExpandableButton={true}/>
                                    <CardText expandable={true}>
                                        <div dangerouslySetInnerHTML= {{__html: extract.content}}>
                                        </div>
                                    </CardText>
                                </Card>
                            </ListItem>
                        </List>
                    </CardText>
                    <CardActions expandable={true}>
                        <RaisedButton primary={true} onMouseUp={this.clickedFindSimilar} label="Find similar documents"/>
                        <RaisedButton primary={true} label="Action2"/>
                    </CardActions>
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
});

const mapDispatchToProps = (dispatch) => {
    return {
        onClip: (content, text) => {
            dispatch(addSnippetToClipboard(content, text));
        },
        onSearch: (text) => {
            dispatch(startKeywordSearch(text));
            dispatch(keywordSearch(text));
        },
        onSetInWorkspace: (content, inWorkspace) => {
            dispatch(setInWorkspace(content, inWorkspace)); 
        }
    };
}


export default connect(null, mapDispatchToProps)(muiThemeable()(ContentDetail));

