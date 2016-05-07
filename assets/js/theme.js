import {
  orange500, orange700,
  cyan500, cyan700,
  pinkA200,
  grey100, grey300, grey400, grey500, grey900,
  white, darkBlack, fullBlack, darkWhite, lightWhite
} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';
import {fontWeightLight, textFullWhite} from 'material-ui/styles/typography';
import {desktopGutter, desktopKeylineIncrement} from 'material-ui/styles/spacing';
import ZIndex from 'material-ui/styles/zIndex';

/**
 *  Light Theme is the default theme used in material-ui. It is guaranteed to
 *  have all theme variables needed for every component. Variables not defined
 *  in a custom theme will default to these values.
 */

export default {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: orange500,
    primary2Color: orange700,
    primary3Color: grey400,
    accent1Color: pinkA200,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: cyan500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  },
  logo: {
      cursor: 'pointer',
      fontSize: 24,
      color: textFullWhite,
      lineHeight: desktopKeylineIncrement + 'px',
      fontWeight: fontWeightLight,
      backgroundColor: cyan500,
      paddingLeft: desktopGutter,
      marginBottom: 8,
    },
  appBar: {
    position: 'fixed',
    top: 0,
    zIndex: ZIndex.appBar +1,
    a: {
      color: darkWhite,
    },
    p: {
      margin: '0 auto',
      padding: 0,
      color: lightWhite,
      maxWidth: 335,
    },
    iconButton: {
      color: darkWhite,
    },
    content: {
      margin: desktopGutter,
    },
  },
  leftNav: {
      zIndex: ZIndex.appBar -1,
      paddingBottom: "64px",
      paddingTop: "128px"  // This is the 64 for the app bar + 64 for fixed div at the top of left nav
  },
  masterBar: {
    contentWhenMedium: {
      margin: `${desktopGutter * 2}px ${desktopGutter * 3}px`,
    },
    footer: {
      backgroundColor: grey900,
      textAlign: 'center',
    },
    a: {
      color: darkWhite,
    },
    p: {
      margin: '0 auto',
      padding: 0,
      color: lightWhite,
      maxWidth: 335,
    },
    iconButton: {
      color: darkWhite,
    },
    fullWidthSection: {
    },
    content: {
    }

  },
  fullWidthSection: {
    root: {
      padding: desktopGutter + 'px',
      boxSizing: 'border-box',
      paddingTop: desktopGutter * 3,
      paddingBottom: desktopGutter * 3,
      margin: '128px auto',
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    rootWhenSmall: {
      paddingTop: desktopGutter * 2,
      paddingBottom: desktopGutter * 2,
    },
    rootWhenLarge: {
      paddingTop: desktopGutter * 3,
      paddingBottom: desktopGutter * 3,
    },
      padding: desktopGutter + 'px',
      boxSizing: 'border-box',
      maxWidth: '1200px',
  }

};
