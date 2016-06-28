import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import ContentDetail from './content-detail';

class ContentPreview extends React.Component {

    render() {
        let title;
        if (this.props.content != null) {
            title="Preview of '" + this.props.content.fields.extract.title + "'";
        } else {
            title="Empty Preview";
        }
        const actions=[
            (<RaisedButton  label="Close" primary={true} onTouchTap={this.props.onClose} />)
        ];
        return(
            <Dialog
                title={title}
                modal={true}
                open={this.props.content != null}
                contentStyle={{width: "90%", maxWidth:null}}
                actions={actions}
                autoScrollBodyContent={true}
            >
                <ContentDetail isPreview={true} content={this.props.content}/>
            </Dialog>
        );
    }
}

ContentPreview.propTypes={
    onClose: React.PropTypes.func.isRequired,
    muiTheme: React.PropTypes.object.isRequired
};

export default muiThemeable()(ContentPreview);
