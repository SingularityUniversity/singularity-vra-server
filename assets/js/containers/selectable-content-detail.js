import { connect } from 'react-redux';
import { addSnippetToClipboard } from '../actions/clipboard-actions';
import ContentDetail from '../components/content-detail';

const mapDispatchToProps = (dispatch) => {
  return {
    onClip: (id, title, text) => {
      dispatch(addSnippetToClipboard(id, title, text));
    }
  };
}

const SelectableContentDetail = connect(null, mapDispatchToProps)(ContentDetail);

export default SelectableContentDetail


