// This file makes the coverage tool import all files (really probably we only need to import master)
// so coverage reporting is accurate for files that aren't tested at all
import Master from '../assets/js/containers/master';
import AppLeftNav from '../assets/js/components/app-left-nav';
import AppMenuBar from '../assets/js/components/app-menu-bar';
import Workspace from '../assets/js/components/workspace';

// Importing app.jsx causes issues because of the import 'react-virtualized/styles.css' statement
// See the following if relevant:
// https://github.com/Firefund/firefund-cli/commit/bfefa45911f5c2c5b4d8b261d7b74e9de516b50a
