import React from 'react';
import ReactDOM from 'react-dom';
import {Card, CardText}  from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import muiThemeable from 'material-ui/styles/muiThemeable';

import d3 from 'd3';
import d3Cloud from 'd3-cloud';

const fill = d3.scale.category20();

const normalizeWeights = (wordmap) => {
    var max = wordmap.reduce(function(prev, current) {
        return Math.max(prev, current[1]);
    }, 0);
    var min = wordmap.reduce(function(prev, current) {
        return Math.min(prev, current[1]);
    }, 999);

    var offset = min;
    var scale = (max-min) * 1.8;  // Experimental value to make a smaller spread, so all words fit
    return wordmap.map(function(current) {
        var newWeight = (current[1]-offset)/scale;
        return [current[0], newWeight];
    });
}

const drawWordCloud = (node, wordsobj) => {
    var normalizedWords = normalizeWeights(wordsobj);
    // wordsobj is a list of word,weight list/tuple
    var cloud = d3Cloud()
        .size([300, 300])
        .words(normalizedWords.map(function(tuple) {
            return {text: tuple[0], size: tuple[1]*90 +10};
        }))
    .padding(5)
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        .on("end", draw);

    /*
     * Create draw as a closure on "node" and "cloud"
     */
    function draw(words) {
        d3.select(node).append('svg')
            .attr("width", cloud.size()[0])
            .attr("height", cloud.size()[1])
            .append("g")
            .attr("transform", "translate(" + cloud.size()[0] / 2 + "," + cloud.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
        .text(function(d) { return d.text; });
    }
    cloud.start();
}

class WordCloud extends React.Component {
    componentDidMount() {
        var el = ReactDOM.findDOMNode(this);
        drawWordCloud(el, this.props.words);
    }

    render() {
        return ( <div></div> )
    }
}

WordCloud.propTypes = {
    words: React.PropTypes.array
}

class TopicsList extends React.Component {
    render() {
        const topicList = this.props.topics.map((topic) => {
            const topicItems = topic[0].map((topicword) => {
                return (
                    <ListItem key={topicword} innerDivStyle={{paddingTop: "5px", paddingBottom: "5px"}}>
                        {topicword[0]} - {topicword[1]}
                    </ListItem>
                )
            });
            return (
                <Card key={topic}>
                    <CardText style={{display: "inline-block"}}>
                        <div style={{fontSize: "120%"}}>Weight: {topic[1]}</div>
                        <List>
                            {topicItems}
                        </List>
                    </CardText>
                    <CardText style={{display: "inline-block"}}>
                        <WordCloud words={topic[0]}/>
                    </CardText>
                </Card>
            )
        });
        return (
            <div>
                {topicList}
            </div>
        )
    }
}

TopicsList.propTypes =  {
    topics: React.PropTypes.arrayOf(React.PropTypes.array)
}

export default  muiThemeable()(TopicsList);

