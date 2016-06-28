import React from 'react';
import {List, MakeSelectable} from 'material-ui/List';
import Drawer from 'material-ui/Drawer';
import Moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {Card, CardTitle} from 'material-ui/Card';
import {spacing, colors} from 'material-ui/styles';
import {AutoSizer,VirtualScroll, InfiniteLoader } from 'react-virtualized';
import IconButton from 'material-ui/IconButton';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import { showSnackbarMessage} from '../actions/snackbar-actions';
import { connect } from 'react-redux';
import ContentPreview from './content-preview';

let SelectableList = MakeSelectable(List);

// XXX: This wrapState is confusing an obfuscates whats going on.
// Propose we mergeis back into AppLeftNav

const wrapState = (ComposedComponent) => {
    class StateWrapper extends React.Component {
        constructor(props) {
            super(props);
            this.state = {selectedIndex: 1};
        }

        handleUpdateSelectedIndex(e, index) {
            this.setState({
                selectedIndex: index
            });
            if (this.props.onChange) {
                this.props.onChange(e, index);
            }
        }

        render() {
            return (
                <ComposedComponent
                    {...this.props}
                    {...this.state}
                    value={this.state.selectedIndex}
                    onChange={() => this.handleUpdateSelectedIndex()}
                />
            );
        }
    };
    return StateWrapper;
}


SelectableList = wrapState(SelectableList);

const propTypes = {
    muiTheme: React.PropTypes.object.isRequired,
    displayedContent: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    workspaceContent: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    totalCount: React.PropTypes.number.isRequired,
    onChangeSelected: React.PropTypes.func.isRequired, // function(content, isSelected)
    loadItems: React.PropTypes.func,
    searchType: React.PropTypes.string,
    searchText: React.PropTypes.string
};

class AppLeftNav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listHeight: window.innerHeight - this.props.muiTheme.leftNav.headerHeight - spacing.desktopGutter,
            selectedPKIDs: [],
            previewContent: null
        };
        this.handleResize = this.handleResize.bind(this);  // Needed for event handler callback logic

    }

    handleResize() {
        this.setState({listHeight: window.innerHeight - this.props.muiTheme.leftNav.headerHeight - spacing.desktopGutter});
    }

    componentWillMount() {
        this.setState({selectedPKIDs: this.getSelectedIDS()});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.workspaceContent) {
            this.setState({selectedPKIDs: nextProps.workspaceContent.map((content) => content.pk)});
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    getSelectedIDS() {
        // XXX: Don't recalculate this every time, only should have to calculate once when mounted component
        return this.props.workspaceContent.map((content) => {
            return content.pk;
        });
    }

    onClickedItem(e, content) {
        e.stopPropagation();
        if (this.state.selectedPKIDs.indexOf(content.pk) < 0 ) {
            this.props.onShowSnackbarMessage("Added content to the workspace");
            this.props.onChangeSelected(content, true);
        }
    }

    showPreview(content) {
        this.setState({previewContent: content});
    }

    onPreviewClose() {
        this.setState({previewContent: null})
    }

    _renderRow(index) {
        let published = '';
        let publisher = '';
        let cardStyle ={cursor: "pointer", whiteSpace: "inherit", boxShadow: 0, backgroundColor:null, height:120} ;

        let content = this.props.displayedContent[index];
        if (!content) {
            return (<Card key={'empty-'+index} style={cardStyle}></Card> );

        }
        if (content.fields.extract['published']) {
            published = Moment(parseInt(content.fields.extract['published'])).format('YYYY-MM-DD');
        }
        if (content.fields.extract['provider_name']) {
            publisher = content.fields.extract['provider_name'];
        }
        const title = (<span style={{fontSize: "125%"}}>{content.fields.extract['title']}</span>);
        const subtitle = (<span>{content.score.toFixed(3)}<br/> <a href="#">{publisher}</a>{published}</span>);
        let addIcon="";

        if (this.state.selectedPKIDs.indexOf(content.pk) >=0 ) {
            cardStyle['backgroundColor'] = colors.grey300;
        } else {
            addIcon=(
                <IconButton onClick={(e) => this.onClickedItem(e, content)} style={{zIndex: 100, float: "right"}}>
                    <ChevronRight/>
                </IconButton>
            );
        }

        return (
            <Card onClick={() => this.showPreview(content)} 
                key={content.pk} style={cardStyle}> 
                {addIcon}
                <CardTitle 
                    title={title} 
                    subtitle={subtitle}
                    titleStyle={{fontSize: '75%', lineHeight:null }}>
                </CardTitle>
            </Card>
            );
    }

    render() {
        const {
            workspaceContent,
            searchType,
            searchText,
            muiTheme,
            totalCount
        } = this.props;
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
                        <i>{workspaceContent.length} in workspace</i><br/>
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
                                     ({index}) => this._renderRow(index)
                                 }
                                 overscanRowCount={10}
                                 />
                                )}    
                            </AutoSizer>
                        )}
                    </InfiniteLoader>
                </div>
                <ContentPreview content={this.state.previewContent} onClose={() => this.onPreviewClose()}/>
            </Drawer>
        );
    }
};

AppLeftNav.propTypes=propTypes;

const mapDispatchToProps = (dispatch) => {
    return {
        onShowSnackbarMessage: (message) => {
            dispatch(showSnackbarMessage(message));
        }
    }
}

export default connect(null, mapDispatchToProps)(muiThemeable()(AppLeftNav));
