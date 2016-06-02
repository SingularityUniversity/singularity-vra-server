import {fade} from 'material-ui/utils/colorManipulator';
import {spacing, colors, typography, zIndex} from 'material-ui/styles';

/**
 *  Light Theme is the default theme used in material-ui. It is guaranteed to
 *  have all theme variables needed for every component. Variables not defined
 *  in a custom theme will default to these values.
 */

const {desktopGutter, desktopKeylineIncrement} = spacing;
const {fontWeightLight, textFullWhite} = typography; 

export default {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  tableRowColumn: {
    spacing: 8
  },
  palette: {
    primary1Color: colors.blueGrey500,
    primary2Color: colors.blueGrey700,
    primary3Color: colors.blueGrey900,
    accent1Color: colors.indigoA200,
    accent2Color: colors.grey100,
    accent3Color: colors.grey500,
    textColor: colors.darkBlack,
    alternateTextColor: colors.white,
    canvasColor: colors.white,
    borderColor: colors.grey300,
    disabledColor: fade(colors.darkBlack, 0.3),
    pickerHeaderColor: colors.blueGrey500,
    clockCircleColor: fade(colors.darkBlack, 0.07),
    shadowColor: colors.fullBlack,
  },
  logo: {
      cursor: 'pointer',
      fontSize: 24,
      color: colors.textFullWhite,
      lineHeight: desktopKeylineIncrement + 'px',
      fontWeight: fontWeightLight,
      backgroundColor: colors.cyan500,
      paddingLeft: desktopGutter,
      marginBottom: 8,
    },
  appBar: {
      position: 'fixed',
      top: 0,
      zIndex: zIndex.appBar +1,
      paddingTop: '0px',
      paddingBottom: '0px',
      paddingLeft: desktopGutter,
      paddingRight: desktopGutter,
    content: {
      a: {
        color: colors.darkWhite,
      },
      p: {
        margin: '0 auto',
        padding: 0,
        color: colors.lightWhite,
        maxWidth: 335,
      },
      iconButton: {
        color: colors.darkWhite,
      },
      content: {
        margin: desktopGutter,
      },
}
  },
  leftNav: {
      zIndex: zIndex.appBar -1,
      paddingTop: desktopKeylineIncrement, 
      headerHeight: desktopKeylineIncrement*2,
  },
  masterBar: {
    contentWhenMedium: {
      margin: `${desktopGutter * 2}px ${desktopGutter * 3}px`,
    },
    footer: {
      backgroundColor: colors.grey900,
      textAlign: 'center',
    },
    a: {
      color: colors.darkWhite,
    },
    p: {
      margin: '0 auto',
      padding: 0,
      color: colors.lightWhite,
      maxWidth: 335,
    },
    iconButton: {
      color: colors.darkWhite,
    },
  },
  fullWidthSection: {
    item: {
      padding: desktopGutter + 'px',
      boxSizing: 'border-box',
      paddingTop: desktopGutter,
      paddingBottom: desktopGutter,
      marginTop: desktopGutter,
      marginBottom: desktopGutter
    },
    root: {
      maxWidth: '1200px',
      marginTop: desktopKeylineIncrement * 2,
      marginRight: desktopKeylineIncrement,
      marginBottom: desktopKeylineIncrement,
      marginLeft: desktopGutter + (desktopKeylineIncrement * 4),
    },
  }
};
