import React from 'react'
import muiThemeable from 'material-ui/styles/muiThemeable'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import ActionHelpOutline from 'material-ui/svg-icons/action/help-outline'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'

const SearchHelpDialog = React.createClass({
  getInitialState() {
    return {open: false}
  },

  toggleState() {
    this.setState({open: !this.state.open})
  },

  helpText() {
    const columnOneWidth = '25%'
    const columnTwoWidth = '50%'
    const columnThreeWidth = '25%'
    return (
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow selectable={false}>
            <TableHeaderColumn style={{width: columnOneWidth}}>Syntax</TableHeaderColumn>
            <TableHeaderColumn style={{width: columnTwoWidth}}>Description</TableHeaderColumn>
            <TableHeaderColumn style={{width: columnThreeWidth}}>Example</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><b>keyword</b></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Search for <b>keyword</b> in all fields.  Multiple keywords<br />are equivalent to an <i>OR</i> query</TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>space<br />space mars</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><b>*</b></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Wildcard for zero or more characters.</TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>nano*</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><b>?</b></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Wildcard for a single character.</TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>space?</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><b>-</b> <i>keyword</i><br /><b>NOT</b> <i>keyword</i></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Excludes keyword from the search.</TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>space -spacex<br />space NOT spacex</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><b>"</b><i>keyword1 keyword2</i><b>"</b></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Exact match for phrase in quotes.</TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>"artificial intelligence"</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><i>keyword1</i> <b>AND</b> <i>keyword2</i><br /><i>keyword1</i> <b>&amp;&amp;</b> <i>keyword2</i></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Both keywords are required in any matches.</TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>artifical AND intelligence<br />biology &amp;&amp; nanotechnology</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><i>keyword1</i> <b>OR</b> <i>keyword2</i><br /><i>keyword1</i> <b>||</b> <i>keyword2</i></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Either keyword is required in a match.</TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>space OR rocket<br />education || learning</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}>"<i>keyword1 keyword2</i>"<b>~x</b></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Proximity match: match all articles that have <i>keyword1</i><br />and <i>keyword2</i> within <i>x</i> words of one another.  The closer<br />the words, the higher the article is weighted.</TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>"nanotechnology robot"~4</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><i>keyword</i><b>~x</b></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Fuzzy match: uses the Damerau-Levenshtein distance to<br />find terms with a maximum of two changes<br />(i.e., insertions, deletions, transpositions, or<br />substitutions).  The default is two, but a distance of one<br />will catch 80% of typical misspellings.</TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>space~<br />space~1</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><i>keyword</i><b>^x</b></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Increases the importance of the search term (called<br />"boosting").  For example, <i>space mars^2</i> would return<br />articles about space, but score those with mars more<br />highly.  The default value for "unboosted" search terms is<br />one.</TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>space mars^2</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><b>(</b><i>keyword expression</i><b>)</b></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Group multiple terms to form sub-queries. </TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>(space OR rocket) AND<br />mars</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><b>field:</b><i>keyword</i></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Match the keyword in a specific field.  Supported fields are:<br />
              <ul>
                <li>url</li>
                <li>title</li>
                <li>author</li>
                <li>language</li>
                <li>content</li>
                <li>keyword</li>
                <li>publisher</li>
              </ul>
            </TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>title:space<br />content:"machine learning"</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><b>_missing_</b><i>:field</i></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Match articles where the specified field has no value (or<br />is missing).</TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>_missing_:author</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableRowColumn style={{width: columnOneWidth}}><b>_exists_</b><i>:field</i></TableRowColumn>
            <TableRowColumn style={{width: columnTwoWidth}}>Match articles where the specified field has any non-null<br /> value.</TableRowColumn>
            <TableRowColumn style={{width: columnThreeWidth}}>_exists_:title</TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    )
  },

  render() {
    const actions = [
      <FlatButton
        label="Ok"
        primary={true}
        onTouchTap={this.toggleState}
        keyboardFocused={true}
      />
    ]

    return (
      <div>
        <IconButton onClick={this.toggleState}><ActionHelpOutline /></IconButton>
        <Dialog
          title='Search Help'
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.toggleState} 
          autoScrollBodyContent={true} >

          {this.helpText()}

        </Dialog>
      </div>
    )
  }
})

export default muiThemeable()(SearchHelpDialog)
