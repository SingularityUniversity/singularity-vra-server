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
          valueLink={{value: this.state.selectedIndex, requestChange: this.handleUpdateSelectedIndex}}
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
    history: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    onRequestChangeLeftNav: React.PropTypes.func.isRequired,
    onRequestChangeList: React.PropTypes.func.isRequired,
    onSelectedContent: React.PropTypes.func.isRequired, // Pass back the _source.fields (corresponds to django Model)
    open: React.PropTypes.bool.isRequired,
    data: React.PropTypes.array, // A list of objects that come back from elasticsearch (currently)
    style: React.PropTypes.object,
    muiTheme: React.PropTypes.object.isRequired,
  },

  handleRequestChangeLink(event, value) {
    window.location = value;
  },

  handleTouchTapHeader() {
    this.props.history.push('/');
    this.setState({
      leftNavOpen: false,
    });
  },

  handleContentSelection(e,content) {
    this.props.onSelectedContent(content._source);
  },

  render() {
    const {
      location,
      docked,
      onRequestChangeLeftNav,
      onRequestChangeList,
      onSelectedContent,
      open,
      data
    } = this.props;

	const style = this.props.muiTheme.leftNav;
    let contentItems = data.map(content => {
      let published = '';
      let publisher = '';
      if (content._source.fields.extract['published']) {
        published = Moment(parseInt(content._source.fields.extract['published'])).format('YYYY-MM-DD');
      }
      if (content._source.fields.extract['provider_name']) {
        publisher = content._source.fields.extract['provider_name'];
      }
      return (
        <ListItem 
          value={content} 
          primaryText={content._source.fields.extract['title']}
          secondaryText={`${publisher} ${published}`} />
      );
    });

    return (
      <Drawer
        containerStyle={style}
        docked={docked}
        open={open}
        onRequestChange={onRequestChangeLeftNav}
      >
          <div style={{position:'fixed', top:"64px", height: "64px"}}>
            My Fixed Header 
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
