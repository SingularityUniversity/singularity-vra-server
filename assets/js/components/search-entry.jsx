import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import TextField from 'material-ui/TextField';


class SearchEntry extends React.Component {
    constructor(props) {
        super(props);
        let initialText = '';
        if (props.initialSearchText != null ){
            initialText = props.initialSearchText;
        }

        this.state = {
            enteredSearchText: initialText
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.initialSearchText != nextProps.initialSearchText) {
            this.setState({enteredSearchText: nextProps.initialSearchText});
        }
    }

    handleSearchChange(evt) {
        this.setState({enteredSearchText: evt.target.value});
    }

    handleSearchKeypress(e) {
        if (e.keyCode != 13) {
            return;
        }
        this.props.onSearch(this.state.enteredSearchText);
    }

    render() {
        return (
            <TextField value={this.state.enteredSearchText} hintText='Search' onChange={(evt) => this.handleSearchChange(evt)} onKeyDown={(evt) => this.handleSearchKeypress(evt)} />
        )
    }
}

SearchEntry.propTypes = {
    initialSearchText: React.PropTypes.string,
    onSearch: React.PropTypes.func.isRequired
}


export default muiThemeable()(SearchEntry);
