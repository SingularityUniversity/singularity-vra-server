import React from 'react';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableFooter, TableRow, TableRowColumn} from 'material-ui/Table';
import Moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {Card, CardActions, CardHeader, CardText, CardTitle}  from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import {spacing, colors, typography, zIndex} from 'material-ui/styles';

let SelectableList = MakeSelectable(List);


// XXX: This wrapState is confusing an obfuscates whats going on.
// Propose we mergeis back into AppLeftNav

function wrapState(ComposedComponent) {
  const StateWrapper = React.createClass({
    getInitialState() {
      return {selectedIndex: 1};
    },
    handleUpdateSelectedIndex(e, index) {
      this.setState({
        selectedIndex: index,
      });
      if (this.props.onChange) {
          this.props.onChange(e, index);
      }
    },
    render() {
      return (
        <ComposedComponent
          {...this.props}
          {...this.state}
          value={this.state.selectedIndex}
          onChange={this.handleUpdateSelectedIndex}
        />
      );
    },
  });
  return StateWrapper;
}

SelectableList = wrapState(SelectableList);
let propTypes = {
    muiTheme: React.PropTypes.object.isRequired,
    displayedContent: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    selectedContent: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    totalCount: React.PropTypes.number.isRequired,
    onChangeSelected: React.PropTypes.func.isRequired, // function(content, isSelected)
    previousPage: React.PropTypes.func,
    nextPage: React.PropTypes.func,
    onFindSimilar: React.PropTypes.func.isRequired,
    searchType: React.PropTypes.string,
  };
const AppLeftNav = React.createClass({

  propTypes: propTypes, 
  handleRequestChangeLink(event, value) {
    window.location = value;
  },
  handleContentSelection(e,content) {
    this.props.onSelectedContent(content);
  },
  onClickedSimilar(e) {
      this.props.onFindSimilar();
  },
  getSelectedIDS() {
    // XXX: Don't recalculate this every time, only should have to calculate once when mounted component
    return this.props.selectedContent.map((content) => {
        return content.pk;
    });
  },
  onClickedItem(content) {
    let selectedPKIDs = this.getSelectedIDS();
    this.props.onChangeSelected(content, selectedPKIDs.indexOf(content.pk) < 0);
  },
  render() {
      console.log("rendering app left nav");
    const {
      onSelectedContent,
      displayedContent, 
      selectedContent,
      searchType,
      muiTheme,
      totalCount
    } = this.props;
    let that = this;
	const style = muiTheme.leftNav;
    let selectedPKIDs = this.getSelectedIDS();
    let contentItems = displayedContent.map((content, index, array) => {
        let published = '';
        let publisher = '';
        if (content.fields.extract['published']) {
            published = Moment(parseInt(content.fields.extract['published'])).format('YYYY-MM-DD');
        }
        if (content.fields.extract['provider_name']) {
            publisher = content.fields.extract['provider_name'];
        }
        let title = (
                <span style={{fontSize: "125%"}}>{content.fields.extract['title']}</span>
                );
        let subtitle = (
                <span>{content.score.toFixed(3)}<br/> <a href="#">{publisher}</a>   {published}</span>
                );
        let cardStyle ={whiteSpace: "inherit", cursor: "pointer", boxShadow: 0, backgroundColor:null} ;
        if (selectedPKIDs.indexOf(content.pk) >=0 ) {
            cardStyle['backgroundColor'] = colors.grey300;
        };
        return (
                <Card onClick={function(e) {that.onClickedItem(content)}} key={content.pk} style={cardStyle}> 
                <CardTitle 
                title={title} 
                subtitle={subtitle}
                titleStyle={{fontSize: '75%', lineHeight:null }}/>
                </Card>
               );
    });

    return (
      <Drawer
        containerStyle={style}
        docked={true}
        open={true}
      >
        <div style={{position:"fixed", "textAlign": "center", "width": "100%"}}>
            <p><strong>{searchType}</strong><br/>
            <i>{totalCount} results</i><br/>
            <i>{selectedContent.length} selected</i><br/>
            </p>
             <RaisedButton primary={true} label="Find Similar Documents" onMouseUp={this.onClickedSimilar} disabled={selectedContent.length == 0}/> 
        </div>
          <div style={{height: "100%", overflowY: "scroll", marginTop: style.headerHeight}}>
            {contentItems}
          </div>
	</Drawer>
    );
  },
});

export default muiThemeable()(AppLeftNav);
