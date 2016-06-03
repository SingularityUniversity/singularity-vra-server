import React from 'react';
import {List, MakeSelectable} from 'material-ui/List';
import Drawer from 'material-ui/Drawer';
import Moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {Card, CardTitle} from 'material-ui/Card';
import {spacing, colors} from 'material-ui/styles';
import {AutoSizer,VirtualScroll, InfiniteLoader } from 'react-virtualized';

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
                selectedIndex: index
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
        }
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
    loadItems: React.PropTypes.func,
    searchType: React.PropTypes.string,
    searchText: React.PropTypes.string
};
const AppLeftNav = React.createClass({
    getInitialState: function() {
        return {listHeight: window.innerHeight - this.props.muiTheme.leftNav.headerHeight - spacing.desktopGutter,
            selectedPKIDs: []
        };
    },
    handleResize: function(e) { // eslint-disable-line no-unused-vars
        this.setState({listHeight: window.innerHeight - this.props.muiTheme.leftNav.headerHeight - spacing.desktopGutter});
    },
    componentWillMount: function() {
        this.setState({selectedPKIDs: this.getSelectedIDS()});
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.selectedContent) {
            this.setState({selectedPKIDs: nextProps.selectedContent.map((content) => content.pk)});
        }
    },
    componentDidMount: function() {
        window.addEventListener('resize', this.handleResize);
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this.handleResize);
    },

    propTypes: propTypes, 
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
    _renderRow(index) {
        let published = '';
        let publisher = '';
        let cardStyle ={whiteSpace: "inherit", cursor: "pointer", boxShadow: 0, backgroundColor:null, height:120} ;

        let content = this.props.displayedContent[index];
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
        if (this.state.selectedPKIDs.indexOf(content.pk) >=0 ) {
            cardStyle['backgroundColor'] = colors.grey300;
        }
        return (
            <Card onClick={function() {that.onClickedItem(content)}} key={content.pk} style={cardStyle}> 
                <CardTitle 
                title={title} 
                subtitle={subtitle}
                titleStyle={{fontSize: '75%', lineHeight:null }}/>
            </Card>
            );


    },
    render() {
        const {
            selectedContent,
            searchType,
            searchText,
            muiTheme,
            totalCount
        } = this.props;
        let that = this;
        const style = muiTheme.leftNav;
        return (
            <Drawer
                containerStyle={style}
                docked={true}
                open={true}
                >
                <div style={{position:"fixed", "textAlign": "center", "width": "100%"}}>
                    <p><strong>{searchType}</strong><br/>
                        {searchText ? (<span><i>'{searchText}'</i><br/></span>) : ''}
                        <i>{totalCount} results</i><br/>
                        <i>{selectedContent.length} selected</i><br/>
                    </p>
                </div>
                <div style={{marginTop: style.headerHeight, height: "100%"}}>
                    <InfiniteLoader
                    isRowLoaded={({index}) => !!this.props.displayedContent[index]}
                    loadMoreRows={this.props.loadItems}
                    rowCount={totalCount}
                    minimumBatchSize={30}
                    >
                        {({ onRowsRendered, registerChild }) => (
                            <AutoSizer>
                            {({height, width }) => 
                                (<VirtualScroll 
                                 ref={registerChild}
                                 width={width}
                                 height={height-style.headerHeight}
                                 rowHeight={120}
                                 rowCount={totalCount}
                                 onRowsRendered={onRowsRendered}
                                 rowRenderer={
                                     ({index}) => that._renderRow(index)
                                 }
                                 overscanRowCount={10}
                                 />
                                )}    
                            </AutoSizer>
                        )}
                    </InfiniteLoader>
                </div>
            </Drawer>
        );
    }
});

export default muiThemeable()(AppLeftNav);
