import Moment from 'moment';
import React from 'react'
import muiThemeable from 'material-ui/styles/muiThemeable'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import ActionList from 'material-ui/svg-icons/action/list'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
// It is breaking encapsulation a bit to use the getSearchStats directly, but its a lot less complicated.
// Not sure what the right pattern is for async actions that do not modify the store
import {getSearchStats} from '../actions/search-actions'

const columnWidths = {
    one: '35%',
    two: '20%',
    three: '25%',
    four: '20%'
}

// XXX: Probably would be good to refactor TopSearches and RecentSearches to share more but not for today


class _TopSearches extends React.Component {

    getRows() {
        if (this.props.top.length == 0) {
            return (
                <TableRow displayBorder={false} selectable={false} style={{height: 24}}>
                    <TableRowColumn>No search history</TableRowColumn>
                </TableRow>
            )
        }
        return this.props.top.map(item => {
            return (
                <TableRow displayBorder={false} key={item.timestamp} selectable={false} style={{height: 24}}>
                    <TableRowColumn style={{height: 24, width: columnWidths.one}}>
                        <a style={{cursor:"pointer"}} onClick={()=>this.props.doSearch(item.query)}>{item.query}</a>
                    </TableRowColumn>
                    <TableRowColumn style={{height: 24, width: columnWidths.two}}>{item.count}</TableRowColumn>
                    <TableRowColumn style={{height: 24, width: columnWidths.three}}>{Moment.unix(item.timestamp).fromNow()}</TableRowColumn>
                    <TableRowColumn style={{height: 24, width: columnWidths.four}}>{item.result_count}</TableRowColumn>
                </TableRow>
            )
        });
    }

    render() {
        return (
            <Table selectable={false}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow selectable={false} style={{height: 24}}>
                        <TableHeaderColumn style={{height: 24, paddingLeft: 8, width: columnWidths.one}}>Query</TableHeaderColumn>
                        <TableHeaderColumn style={{height: 24, paddingLeft: 8, width: columnWidths.two}}>Count</TableHeaderColumn>

                        <TableHeaderColumn style={{height: 24, paddingLeft: 8, width: columnWidths.three}}>Last Queried</TableHeaderColumn>
                        <TableHeaderColumn style={{height: 24, paddingLeft: 8, width: columnWidths.four}}>Last Result Count</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                    {this.getRows()}
                </TableBody>
            </Table>
        )
    }
}

const TopSearches = muiThemeable()(_TopSearches);

class _RecentSearches extends React.Component {
    getRows() {
        if (this.props.recent.length == 0) {
            return (
                <TableRow displayBorder={false} selectable={false} style={{height: 24}}>
                    <TableRowColumn>No recent searches</TableRowColumn>
                </TableRow>
            )
        }
        return this.props.recent.map(item => {
            return (
                <TableRow displayBorder={false} key={item.timestamp} selectable={false} style={{height: 24}}>
                    <TableRowColumn style={{height: 24, width: columnWidths.one+columnWidths.two}}>
                        <a style={{cursor:"pointer"}} onClick={()=>this.props.doSearch(item.query)}>{item.query}</a>
                    </TableRowColumn>
                    <TableRowColumn style={{height: 24, width: columnWidths.three}}>{Moment.unix(item.timestamp).fromNow()}</TableRowColumn>
                    <TableRowColumn style={{height: 24, width: columnWidths.four}}>{item.result_count}</TableRowColumn>
                </TableRow>
            )
        });
    }

    render() {
        return (
            <Table selectable={false}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow selectable={false} style={{height: 24}}>
                        <TableHeaderColumn style={{height: 24, paddingLeft: 8, width: columnWidths.one+columnWidths.two}}>Query</TableHeaderColumn>

                        <TableHeaderColumn style={{height: 24, paddingLeft: 8, width: columnWidths.three}}>Last Queried</TableHeaderColumn>
                        <TableHeaderColumn style={{height: 24, paddingLeft: 8, width: columnWidths.four}}>Last Result Count</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                    {this.getRows()}
                </TableBody>
            </Table>
        )
    }
}

const RecentSearches = muiThemeable()(_RecentSearches);

class SearchStatsDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state={open:false, searchStats:{top:[], recent:[]}}
    }

    toggleState() {
        this.setState({open: !this.state.open})
    }

    showDialog() {
        this.setState({open: true});
        getSearchStats()
            .then(stats => {
                this.setState({searchStats: stats})
            });
    }

    doSearch(query) {
        this.setState({open: false});
        this.props.doSearch(query);
    }

    render() {
        const actions = [
            <FlatButton
                label="Ok"
                primary={true}
        onTouchTap={()=>this.toggleState()}
        keyboardFocused={true}
        />
        ]

        return (
            <div>
                <IconButton onClick={() => this.showDialog()}><ActionList /></IconButton>
                <Dialog
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={() => this.toggleState() }
                    autoScrollBodyContent={true} >
                    <h4 style={{marginTop: 10, marginBottom: 10}}>Top Searches</h4>
                    <TopSearches top={this.state.searchStats.top} doSearch={(query) => this.doSearch(query)}/>
                    <h4 style={{marginTop: 40, marginBottom: 10}}>Recent Searches</h4>
                    <RecentSearches recent={this.state.searchStats.recent} doSearch={(query) => this.doSearch(query)}/>
                </Dialog>
            </div>
        )
    }
}

SearchStatsDialog.props={
    doSearch: React.PropTypes.func.isRequired
}

export default muiThemeable()(SearchStatsDialog)
