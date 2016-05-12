import React from 'react';
import Divider from 'material-ui/Divider';
import {Card, CardActions, CardHeader, CardText, CardTitle}  from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {List, ListItem} from 'material-ui/List';
import muiThemeable from 'material-ui/styles/muiThemeable';
import TopicsList from './lda_topics'

import Moment from 'moment';

const ContentDetail = React.createClass({

    propTypes: {
        content: React.PropTypes.object,
        summaries: React.PropTypes.arrayOf(React.PropTypes.string),
		muiTheme: React.PropTypes.object.isRequired,
		onAction: React.PropTypes.func.isRequired  // onAction(action_id, params)
    }, 
	clickedFindSimilar() {
		console.log(this.props.content.pk);
		if (this.props.onAction) {
			this.props.onAction('similar', {content:this.props.content})
		}
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
			console.log("Looking at content objects: ", content);
	  	 	if (content.lda_similarity_topics) {
				lda_stuff = (
					<ListItem>	
					LDA-Inferred Topics - Similarity to Query Candidate is {content.lda_match_weight}
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
            return (
                <Card style={this.props.muiTheme.fullWidthSection.root} containerStyle={this.props.muiTheme.fullWidthSection.container}t>
                    <CardTitle 
                        title={extract.title} 
                        subtitle={"From: "+extract.provider_name}
                        titleStyle={{textAlign: 'center'}}
                        subtitleStyle={{textAlign: 'center'}}/> 
                    <CardText>
                        <List>
                            <ListItem>Published on:  {`${publishedDate}`} </ListItem>
                            <ListItem>URL: <a target="vra_preview" href={extract.url}>{extract.url}</a></ListItem>
                            <ListItem>
                                Summary:
                                <Card>
                                <CardText>
                                    {
                                        (this.props.summaries.length ==0 ) ? "No content" :
                                            this.props.summaries.map(function(val) {
                                            return (<li key={val}>{val}</li>);
                                            })
                                    }
                                </CardText>
                                </Card>
                            </ListItem>
						{lda_stuff}
							<ListItem>
							Content:
							<Card>
							<CardTitle actAsExpander={true} showExpandableButton={true}/>
								<CardText expandable={true}>
									<div dangerouslySetInnerHTML= {{__html: extract.content}}>
									</div>
								</CardText>
							</Card>

							</ListItem>
                        </List>
                    </CardText>
                    <CardActions>
                        <RaisedButton primary={true} onMouseUp={this.clickedFindSimilar} label="Find similar articles"/>
                        <RaisedButton secondary={true} label="Action2"/>
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

export default  muiThemeable()(ContentDetail);

