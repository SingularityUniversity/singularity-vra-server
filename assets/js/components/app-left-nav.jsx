import React from 'react';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableFooter, TableRow, TableRowColumn} from 'material-ui/Table';
import Moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {Card, CardActions, CardHeader, CardText, CardTitle}  from 'material-ui/Card';

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
var propTypes = {
    docked: React.PropTypes.bool.isRequired,
    selectedIndexes: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    onRequestChangeLeftNav: React.PropTypes.func,
    onSelectedContent: React.PropTypes.func.isRequired, // Pass back the content.fields (corresponds to django Model)
    open: React.PropTypes.bool.isRequired,
    data: React.PropTypes.array, // A list of objects that come back from elasticsearch (currently)
    resultCountTotal: React.PropTypes.number,
    searchType: React.PropTypes.string,
    style: React.PropTypes.object,
    muiTheme: React.PropTypes.object.isRequired,
  };
const AppLeftNav = React.createClass({

  propTypes: propTypes, 
  handleRequestChangeLink(event, value) {
    window.location = value;
  },
  handleContentSelection(e,content) {
    this.props.onSelectedContent(content);
  },

  onRowSelection(selectionList) {
      let that=this;
      let selectedItems;
      if (selectionList == "all") {
            selectedItems = this.props.data.map(function(item, index) {
                return index;
            });
      } else {
          selectedItems = selectionList;
      }
      console.log("Selected: ", selectedItems);

      let value =  this.props.onSelectedContent(selectedItems);
  },
  render() {
      console.log("rendering app left nav");
    const {
      docked,
      onRequestChangeLeftNav,
      onSelectedContent,
      open,
      data
    } = this.props;

	const style = this.props.muiTheme.leftNav;
    let contentItems = data.map((content, index, array) => {
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
        let selected = (this.props.selectedIndexes.indexOf(index) >= 0);
        return (
                <TableRow selected={selected} key={content.pk}>
                <TableRowColumn style={{whiteSpace: "inherit", cursor: "pointer"}}>
                <Card style={{boxShadow: 0, backgroundColor:null}}> 
                <CardTitle 
                title={title} 
                subtitle={subtitle}
                titleStyle={{fontSize: '95%', lineHeight:null }}/>
                </Card>
                </TableRowColumn>
                </TableRow>
               );
    });

    return (
      <Drawer
        containerStyle={style}
        docked={docked}
        open={open}
        onRequestChange={onRequestChangeLeftNav}
      >
        <div style={{position:"fixed", "textAlign": "center", "width": "100%"}}>
            <strong>{this.props.searchType}</strong><br/>
            <i>{this.props.resultCountTotal} results</i>
        </div>
          <Table onRowSelection={this.onRowSelection} multiSelectable={true} fixedHeader={true} wrapperStyle={{height: "100%", overflowY: "scroll", marginTop: style.headerHeight}}>
            <TableBody deselectOnClickaway={false} displayRowCheckbox={false}>
            {contentItems}
            </TableBody>
          </Table>
	</Drawer>
    );
  },
});

export default muiThemeable()(AppLeftNav);
