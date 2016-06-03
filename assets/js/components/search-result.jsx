import React, { Component, PropTypes } from 'react';
import { ItemTypes } from '../dnd';
import { DragSource } from 'react-dnd';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {Card, CardTitle} from 'material-ui/Card';
import Moment from 'moment';

const searchResultSource = {
  beginDrag(props) {
    return {};
  }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

@DragSource(ItemTypes.SEARCH_RESULT, searchResultSource, collect)
class SearchResult extends Component {
    static propTypes = {
        connectDragSource: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired,
        content: PropTypes.object.isRequired,
        selectedPKIDs: PropTypes.arrayOf(PropTypes.number).isRequired
    };

    render() {
        const { connectDragSource, isDragging } = this.props;

        let published = '';
        let publisher = '';
        let cardStyle ={whiteSpace: "inherit", cursor: "pointer", boxShadow: 0, backgroundColor:null, height:120,
         opacity: isDragging ? 0.5 : 1,} ;

        let content = this.props.content;
        if (!content) {
            return (<Card key={'empty-'+index} style={cardStyle}></Card> );

        }
        let that = this;
        if (content.fields.extract['published']) {
            published = Moment(parseInt(content.fields.extract['published'])).format('YYYY-MM-DD');
        }
        if (content.fields.extract['provider_name']) {
            publisher = content.fields.extract['provider_name'];
        }
        let title = (<span style={{fontSize: "125%"}}>{content.fields.extract['title']}</span>);
        let subtitle = (<span>{content.score.toFixed(3)}<br/> <a href="#">{publisher}</a>{published}</span>);
        if (this.props.selectedPKIDs.indexOf(content.pk) >=0 ) {
            cardStyle['backgroundColor'] = colors.grey300;
        }

        return (
            <Card onClick={function() {console.log("HMM")}} key={content.pk} style={cardStyle}> 
                <CardTitle 
                    title={title} 
                    subtitle={subtitle}
                    titleStyle={{fontSize: '75%', lineHeight:null }}/>
            </Card>
        );
    }
}


//SearchResult = muiThemeable()(SearchResult);
export {SearchResult};

