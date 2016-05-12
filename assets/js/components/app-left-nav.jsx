import React from 'react';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';

import Moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';

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

const AppLeftNav = React.createClass({

  propTypes: {
    docked: React.PropTypes.bool.isRequired,
    onRequestChangeLeftNav: React.PropTypes.func,
    onSelectedContent: React.PropTypes.func.isRequired, // Pass back the content.fields (corresponds to django Model)
    open: React.PropTypes.bool.isRequired,
    data: React.PropTypes.array, // A list of objects that come back from elasticsearch (currently)
    resultCountTotal: React.PropTypes.number,
    searchType: React.PropTypes.string,
    style: React.PropTypes.object,
    muiTheme: React.PropTypes.object.isRequired,
  },

  handleRequestChangeLink(event, value) {
    window.location = value;
  },


  handleContentSelection(e,content) {
    this.props.onSelectedContent(content);
  },

  render() {
    const {
      docked,
      onRequestChangeLeftNav,
      onSelectedContent,
      open,
      data
    } = this.props;

	const style = this.props.muiTheme.leftNav;
    let contentItems = data.map(content => {
      let published = '';
      let publisher = '';
      if (content.fields.extract['published']) {
        published = Moment(parseInt(content.fields.extract['published'])).format('YYYY-MM-DD');
      }
      if (content.fields.extract['provider_name']) {
        publisher = content.fields.extract['provider_name'];
      }
      return (
        <ListItem 
		  key={content}
          value={content} 
          primaryText={content.fields.extract['title']}
          secondaryText={
            <p><span><a href="#">{publisher}</a>   {published}</span></p>
          }
          />
      );
    });

    return (
      <Drawer
        containerStyle={style}
        docked={docked}
        open={open}
        onRequestChange={onRequestChangeLeftNav}
      >
          <div className='pad-left' style={{position:'fixed', top:"64px", height: "64px"}}>
            <span className='medium'>{this.props.searchType}</span><br />
            <span className='small'><i>{this.props.resultCountTotal} results</i></span> 
          </div>

          <SelectableList  onChange={this.handleContentSelection} style={{height: "100%", overflow:"scroll"}}>
            {contentItems}
          </SelectableList>
          <div style={{position:'fixed', height: "64px", bottom:"0px"}}>
            My Fixed Footer
          </div>
	</Drawer>
    );
  },
});

export default muiThemeable()(AppLeftNav);
