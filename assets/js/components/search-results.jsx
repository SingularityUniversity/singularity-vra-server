import React from 'react';
import {List, MakeSelectable} from 'material-ui/List';
import Drawer from 'material-ui/Drawer';
import Moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {Card, CardTitle} from 'material-ui/Card';
import {spacing, colors} from 'material-ui/styles';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {AutoSizer, List as RVList, InfiniteLoader} from 'react-virtualized';
import IconButton from 'material-ui/IconButton';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import { showSnackbarMessage} from '../actions/snackbar-actions';
import { connect } from 'react-redux';
import ContentPreview from './content-preview';
import VisibilityButton from '../components/visibility-button';
import Divider from 'material-ui/Divider';
import { wordCountToTag, ariToGradeLevel, round } from '../util/readability';
import { authorListToString } from '../util/text';
import {SortType, SortDirection, getSortTypeString, getSortDirectionString} from '../constants/enums';
import {SEARCH_TYPE_KEYWORD, SEARCH_TYPE_SIMILARITY} from  '../actions/search-actions';

let SelectableList = MakeSelectable(List);

// XXX: This wrapState is confusing an obfuscates whats going on.
// Propose we mergeis back into SearchResults

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
    }
    return StateWrapper;
}


SelectableList = wrapState(SelectableList);

const propTypes = {
    muiTheme: React.PropTypes.object.isRequired,
    displayedContent: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    workspaceContent: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    totalCount: React.PropTypes.number.isRequired,
    onChangeSelected: React.PropTypes.func.isRequired, // function(content, isSelected)
    onKeywordSearch: React.PropTypes.func,
    loadItems: React.PropTypes.func,
    searchType: React.PropTypes.string,
    searchText: React.PropTypes.string,
    searchSortType: React.PropTypes.number,
    searchSortDirection: React.PropTypes.number,
};

class SearchResults extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listHeight: window.innerHeight - this.props.muiTheme.leftNav.headerHeight * 1.5 - spacing.desktopGutter,
            selectedPKIDs: [],
            previewContent: null
        };
        this.handleResize = this.handleResize.bind(this);  // Needed for event handler callback logic

    }

    handleResize() {
        this.setState({listHeight: window.innerHeight - this.props.muiTheme.leftNav.headerHeight * 1.5 - spacing.desktopGutter});
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
        this.setState({previewContent: null});
    }

    reverseSortDirection(direction) {
        if (direction == SortDirection.ASCENDING) {
            return SortDirection.DESCENDING;
        } else {
            return SortDirection.ASCENDING;
        }
    }

    sortSearchResults(evt, index, value) {
        if (this.props.searchType == SEARCH_TYPE_KEYWORD) { 
            let direction = this.props.searchSortDirection;
            // If they click on the same item, reverse the order
            if (value == this.props.searchSortType) {
                direction = this.reverseSortDirection(direction);
            } else { // set default orderings for each type to DESCENDING
                direction = SortDirection.DESCENDING;
            }
            this.props.onKeywordSearch(this.props.searchText, value, direction);
        }
    }

    sortText(field) {
        let direction = (this.props.searchSortType == field) ?
            getSortDirectionString(this.props.searchSortDirection) :
            '';
        return getSortTypeString(field) + " " + direction;
    }

    _renderRow(index) {
        const MAX_TITLE_LENGTH = 90;
        const MAX_SUMMARY_LENGTH = 135;
        const MAX_AUTHOR_LENGTH = 100;
        let titleText = '';
        let published = '';
        let publisher = '';
        let author = '';
        let summary = '';
        let cardStyle ={cursor: "pointer", whiteSpace: "inherit", boxShadow: 0, backgroundColor:null, height:120} ;

        let content = this.props.displayedContent[index];
        let readabilityLength = null;
        let readabilityARI = null;

        if (!content) {
            return (<Card key={'empty-'+index} style={cardStyle}></Card> );

        }
        if (content.fields.pre_processed && content.fields.pre_processed['readability']['sentence_info']) {
            let sentenceInfo = content.fields.pre_processed['readability']['sentence_info'];
            readabilityLength = sentenceInfo['words'];
            readabilityARI = content.fields.pre_processed['readability']['readability_grades']['ARI'];
        }

        titleText = content.fields.extract['title'];
        titleText = (titleText === null) ? '' : titleText;
        if (titleText.length > MAX_TITLE_LENGTH) {
            titleText = titleText.slice(0,MAX_TITLE_LENGTH+1) + '...';
        }

        if (content.fields.extract['published']) {
            published = (<div style={{fontSize:12}}>Published on {Moment(parseInt(content.fields.extract['published'])).format('YYYY-MM-DD')}</div>);
        }
        if (content.fields.extract['provider_name']) {
            publisher = content.fields.extract['provider_name'];
        }
        // build up the list of authors (assuming one exists)
        if (content.fields.extract['authors'] && content.fields.extract['authors'].length > 0) {
            author = authorListToString(content.fields.extract['authors']);
            if (author.length > MAX_AUTHOR_LENGTH) {
                author = author.slice(0, MAX_AUTHOR_LENGTH+1) + '...';
            }
        }
        if (content.fields.pre_processed['summary_sentences'] && content.fields.pre_processed['summary_sentences'].length > 0) {
            // get the first N characters (if there are that many)
            for (let i=0; i<content.fields.pre_processed['summary_sentences'].length; i++) {
                summary += content.fields.pre_processed['summary_sentences'][i] + ' ';
                if (summary.length >= MAX_SUMMARY_LENGTH) break;
            }
            summary = summary.slice(0, MAX_SUMMARY_LENGTH+1);
            summary += "..."
        }
        let addIcon="";
        if (this.state.selectedPKIDs.indexOf(content.pk) >=0 ) {
            cardStyle['backgroundColor'] = colors.grey300;
        } else {
            addIcon=(
                <IconButton onClick={(e) => this.onClickedItem(e, content)} style={{width: 48, zIndex: 9900, verticalAlign: "top", float: "right"}} >
                    <ChevronRight/>
                </IconButton>
            );
        }
        let scoreblock="";
        if (content.score) {
            scoreblock = (<span>Score: {content.score.toFixed(3)} &nbsp;&nbsp;&nbsp;</span>);
        };  
        const title = (<span><span style={{fontSize: 14, lineHeight: "1em", display: "inline-block", width:this.props.width-32-48-24, textOverflow: "ellipsis", maxHeight: "4em", overflow:"hidden"}}>{titleText}</span>{addIcon}</span>); // 32 from padding from cardtitle, 48 for button, 24 for collapse/open icon button
const subtitle = (<span><div className="search-summary">{summary}</div><div style={{fontSize: 12}}>{author}</div>
    <div style={{fontSize: 12}}>{scoreblock}Length: {wordCountToTag(readabilityLength)} &nbsp;&nbsp;&nbsp; ARI: {round(readabilityARI, 2)} ({ariToGradeLevel(readabilityARI)})</div> {published} <a href="#">{publisher}</a></span>);


        return (
            <Card onClick={() => this.showPreview(content)}
                key={content.pk} style={cardStyle}>
                <CardTitle
                    titleStyle={{fontSize: 14, lineHeight: '1em'}}
                    title={title}
                    subtitle={subtitle}>
                </CardTitle>
            </Card>
            );
    }

    render() {
        let {
            searchType,
            searchText,
            searchSince,
            muiTheme,
            totalCount
        } = this.props;
        const style = {...muiTheme.leftNav, overflow: "visible"};
        if ((searchType == '') || (searchType == null)) {
            searchType = "Search results";
        }
        let sinceDescription = "";
        if (searchSince) {
            sinceDescription = (<span><br/><em>New since {Moment.unix(searchSince).fromNow()}</em></span>);
        }
        return (
            <div>
                <div style={{
                    position: "fixed",
                    left: 0,
                    top: "50%"
                }}>
                    <VisibilityButton
                        onClick={this.props.onSearchResultsVisibilityClick}
                        open={this.props.open}
                        tooltipPosition="bottom-right"
                        tooltipOpenedText="Close search results"
                        tooltipClosedText="Open search results"
                        side="left"/>
                </div>
                <Drawer
                    containerStyle={style}
                    docked={true}
                    open={this.props.open}
                    width={this.props.width}
                    >
                    <div style={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        zIndex: 9999
                    }}>
                        <VisibilityButton
                            onClick={this.props.onSearchResultsVisibilityClick}
                            open={this.props.open}
                            tooltipPosition="bottom-center"
                            tooltipOpenedText="Close search results"
                            tooltipClosedText="Open search results"
                            side="left"/>
                    </div>
                    <div style={{position:"fixed", "textAlign": "center", "width": "100%"}}>
                        <div>
                        <p><strong>{searchType}</strong>{sinceDescription}<br/>
                            {searchText ? (<span><i>{searchText}</i><br/></span>) : ''}
                            <i>{totalCount} results</i><br/>
                        </p>
                       
                        <div style={{ visibility:this.props.searchType==SEARCH_TYPE_KEYWORD? "visible" : "hidden"}}>
                            <SelectField 
                                ref="sortType"
                                value={this.props.searchSortType}
                                style={{customWidth: 50}}
                                floatingLabelText="Sort Order"
                                onChange={this.sortSearchResults.bind(this)}>
                                <MenuItem value={SortType.PUBLICATION_DATE} primaryText={this.sortText(SortType.PUBLICATION_DATE)} />
                                <MenuItem value={SortType.RELEVANCE} primaryText={this.sortText(SortType.RELEVANCE)} />
                            </SelectField>
                        </div>
                    </div>
                        <Divider/>
                    </div>
                    <div style={{marginTop: style.headerHeight, height: "100%", paddingRight: "24px"}}>
                        <InfiniteLoader
                        isRowLoaded={({index}) => !!this.props.displayedContent[index]}
                        loadMoreRows={this.props.loadItems}
                        rowCount={totalCount}
                        minimumBatchSize={30}
                        >
                            {({ onRowsRendered, registerChild }) => (
                                <AutoSizer>
                                {({height, width }) => 
                                    (<RVList
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
                    <ContentPreview onClose={() => this.onPreviewClose()} content={this.state.previewContent}/>
                </Drawer>
            </div>
        );
    }
}

SearchResults.propTypes=propTypes;

const mapDispatchToProps = (dispatch) => {
    return {
        onShowSnackbarMessage: (message) => {
            dispatch(showSnackbarMessage(message));
        }
    }
}

export default connect(null, mapDispatchToProps)(muiThemeable()(SearchResults));
