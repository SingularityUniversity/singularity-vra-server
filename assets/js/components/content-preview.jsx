import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import ContentDetail from './content-detail';

class ContentPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state={open:false};
    }

    toggleState() {
        this.setState({open: !this.state.open})
    }

    requestClose() {
        this.toggleState();
    }

    componentWillReceiveProps(newProps) {
        if (newProps.content != null) {
            this.setState({open: true});
        }
    }
    render() {
        let title;
        if (this.props.content != null) {
            title="Preview of '" + this.props.content.fields.extract.title + "'";
        } else {
            title="Empty Preview";
        }
        const actions=[
            (<RaisedButton   keyboardFocused={true} label="Close" primary={true} onTouchTap={() => this.requestClose()} />)
        ];
        return(
            <Dialog
                title={title}
                modal={false}
                open={this.state.open}
                contentStyle={{width: "90%", maxWidth:null}}
                actions={actions}
                autoScrollBodyContent={true}
                onRequestClose={() => this.toggleState()}
            >
                <ContentDetail isPreview={true} content={this.props.content}/>
            </Dialog>
        );
    }
}

ContentPreview.propTypes={
    muiTheme: React.PropTypes.object.isRequired,
    content: React.PropTypes.object.isRequired

};

export default muiThemeable()(ContentPreview);
