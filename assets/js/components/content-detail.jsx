import React from 'react';
import Divider from 'material-ui/lib/divider';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';
import CardText from 'material-ui/lib/card/card-text';
import CardTitle from 'material-ui/lib/card/card-title';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';


import {
  Colors,
  Spacing,
  Typography,
} from 'material-ui/lib/styles';
import {StylePropable} from 'material-ui/lib/mixins';

const ContentDetail = React.createClass({

    propTypes: {
        content: React.PropTypes.object.isRequired
    }, 
    contentTyeps: {
        muiTheme: React.PropTypes.object
    },

    mixins: [
        StylePropable,
    ],

    render() {
        const {
            content
        } = this.props;
        console.log("Content is ", content);
        if (content ) {
            return (
                <Card>
                    <CardTitle actAsExpander={true}
                        showExpandableButton={true}
                        title={content.extract.title} 
                        subtitle={"From: "+content.extract.provider_name}/> 
                    <CardText>
                        <List>
                            <ListItem>Published on:  
                                {content.extract.published?(new Date(content.extract.published)).toString() : "Unknown"}
                                </ListItem>
                            <ListItem>URL: <a href={content.extract.url}>{content.extract.url}</a></ListItem>
                        </List>
                        <pre>{JSON.stringify(content)}</pre>
                    </CardText>
                    <CardActions>
                        <RaisedButton primary={true} label="Action1"/>
                        <RaisedButton secondary={true} label="Action2"/>
                    </CardActions>
                    <Card expandable={true}>
                    <CardTitle title="Content"/>
                        <CardText>
                            <div dangerouslySetInnerHTML= {{__html: content.extract.content}}>
                            </div>
                        </CardText>
                    </Card>
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

export default ContentDetail;

