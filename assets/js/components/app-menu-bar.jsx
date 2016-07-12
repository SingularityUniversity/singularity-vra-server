import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import AppBar from 'material-ui/AppBar';
import {ToolbarGroup} from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import ArrowForward from 'material-ui/svg-icons/navigation/arrow-forward';
import SearchHelpDialog from '../components/search-help-dialog';
import SearchEntry from '../components/search-entry';
import SearchStatsDialog from '../components/search-stats-dialog';


class AppMenuBar extends React.Component {

    render() {
        const styles = this.props.muiTheme;
        const title = (<span>Virtual Research Assistant <i className='small'>({this.props.articleCount} articles and counting...)</i></span>);
        return(
            <AppBar
                title={title}
                titleStyle={styles.appBar.content}
                zDepth={0}
                style={styles.appBar}
                showMenuIconButton={false} >
                <ToolbarGroup>
                    <IconButton disabled={!this.props.canUndoSearch} onClick={this.props.onUndo}><ArrowBack/></IconButton>
                    <IconButton disabled={!this.props.canRedoSearch} onClick={this.props.onRedo}><ArrowForward/></IconButton>
                </ToolbarGroup>
                <ToolbarGroup float='right'>
                    <SearchEntry
                        initialSearchText={this.props.initialSearchText}
                        onSearch={this.props.doSearch}
                    />
                    <SearchStatsDialog  doSearch={this.props.doSearch}/>
                    <SearchHelpDialog/>
                </ToolbarGroup>
            </AppBar>

        )
    }
}

AppMenuBar.props={
    articleCount: React.PropTypes.number.isRequired,
    canUndoSearch: React.PropTypes.bool.isRequired,
    canRedoSearch: React.PropTypes.bool.isRequired,
    onUndo: React.PropTypes.func.isRequired,
    onRedo: React.PropTypes.func.isRequired,
    initialSearchText: React.PropTypes.string.isRequired,
    doSearch: React.PropTypes.func.isRequired
}

export default muiThemeable()(AppMenuBar)
