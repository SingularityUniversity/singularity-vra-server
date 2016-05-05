import React from 'react';
import LeftNav from 'material-ui/lib/left-nav';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Divider from 'material-ui/lib/divider';
import {SelectableContainerEnhance} from 'material-ui/lib/hoc/selectable-enhance';
import {
  Colors,
  Spacing,
  Typography,
} from 'material-ui/lib/styles';
import {StylePropable} from 'material-ui/lib/mixins';
import Moment from 'moment';

let SelectableList = SelectableContainerEnhance(List);


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
  },

  contextTypes: {
    muiTheme: React.PropTypes.object,
    //router: React.PropTypes.func,
  },

  mixins: [
    StylePropable,
  ],


  handleRequestChangeLink(event, value) {
    window.location = value;
  },

  handleTouchTapHeader() {
    this.props.history.push('/');
    this.setState({
      leftNavOpen: false,
    });
  },

  getStyles() {
    return {
      logo: {
        cursor: 'pointer',
        fontSize: 24,
        color: Typography.textFullWhite,
        lineHeight: Spacing.desktopKeylineIncrement + 'px',
        fontWeight: Typography.fontWeightLight,
        backgroundColor: Colors.cyan500,
        paddingLeft: Spacing.desktopGutter,
        marginBottom: 8,
      },
    };
  },


  handleContentSelection(e,content) {
      console.log("Got content", content);
    this.props.onSelectedContent(content._source.fields);
  },

  render() {
    const {
      location,
      docked,
      onRequestChangeLeftNav,
      onRequestChangeList,
      onSelectedContent,
      open,
      style,
      data
    } = this.props;

    const styles = this.getStyles();

    console.log('left-nav')
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
      <LeftNav
        style={style}
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
      </LeftNav>
    );
  },
});

export default AppLeftNav;
