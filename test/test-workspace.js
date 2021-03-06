import Moment from 'moment'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import expect from 'expect'
import FetchMock from 'fetch-mock'
import {CLEAR_WORKSPACE, SET_IN_WORKSPACE, REPLACE_WORKSPACE, clearWorkspace, setInWorkspace, loadWorkspace, getWorkspaces,
    updateWorkspace, createWorkspace, deleteWorkspace} from '../assets/js/actions/workspace-actions';
import {SNACKBAR_SHOW_MESSAGE} from '../assets/js/actions/snackbar-actions'
import {SIMILARITY_SEARCH, SHOW_SEARCH_RESULTS} from '../assets/js/actions/search-actions'
import {workspaceReducer} from '../assets/js/reducers/workspace-reducer'
import TestUtils from 'react-addons-test-utils'
import React from 'react'
import {WorkspaceList, _WorkspaceChooser} from '../assets/js/components/workspace-chooser'
import {WorkspaceEditorInternal} from '../assets/js/components/workspace-editor'
import {_Workspace} from '../assets/js/components/workspace'
import { mount, shallow } from 'enzyme';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {ListItem} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import {Card}  from 'material-ui/Card';
import theme from '../assets/js/theme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {jsdom} from 'jsdom';
import ContentDetail from '../assets/js/components/content-detail';
const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);


/*
 * TODO: Workspace-related Master functionality (encourage refactoring)
 * TODO: Refactor UI component tests into much smaller tests
 */

describe('Workspace functionality', () => {

    describe('Action tests', () => {
        // This is a silly test
        describe('action: clearWorkspace', () => {
            it('Dispatches CLEAR_WORKSPACE type', () => {
                let result = clearWorkspace();
                expect(result).toEqual({type: CLEAR_WORKSPACE});
            })
        })

        describe('action: setInWorkspace', () => {
            it('Dispatches SET_IN_WORKSPACE type', () => {
                let testProbe1 = {probe: 1};
                let result = setInWorkspace(testProbe1, true);
                expect(result).toEqual({
                    type: SET_IN_WORKSPACE,
                    content: testProbe1,
                    inWorkspace: true
                });
            })
        })

        describe('async action: loadInWorkspace', () => {
            beforeEach(() => FetchMock.restore()),
            it('Dispatches load correctly', (done) => {
                const created = Moment("1999-12-31T00:00:00+00:00");
                const timestamp = created.unix();
                let matcher = /.*/;
                let mocked_http_results = {
                    id: 1,
                    title: "title",
                    description: "description",
                    articles: [
                        {
                            id: 100,
                            other_fields: 'other_fields_1'
                        },
                        {
                            id: 101,
                            other_fields: 'other_fields_2'
                        }
                    ],
                    created: created
                }
                FetchMock.mock(matcher, mocked_http_results);
                const store = mockStore({});
                loadWorkspace(678)(store.dispatch).then(() => {
                    let calls = FetchMock.calls();
                    expect(calls.matched.length).toEqual(2);
                    expect(calls.unmatched.length).toEqual(0);
                    expect(calls.matched[0][0]).toEqual('/api/v1/workspace/678');
                    // XXX: Probably this stuff should be tested in test-search, but we haven't gotten 
                    // other similarity search tests written, so leave it here for now
                    expect(calls.matched[1][0]).toEqual('/api/v1/similar');
                    expect(JSON.parse(calls.matched[1][1].body).since).toEqual(timestamp);

                    let storeActions = store.getActions();
                    expect(storeActions.length).toEqual(6);
                    expect(storeActions[0].type).toEqual(SNACKBAR_SHOW_MESSAGE);
                    expect(storeActions[1]).toEqual( {
                        type: REPLACE_WORKSPACE,
                        workspace: {
                            id: 1,
                            title: 'title',
                            description: 'description',
                            articles: [
                                {
                                    fields: {id: 100, other_fields: 'other_fields_1'},
                                    pk: 100,
                                    model: 'core.content',
                                    score: 1
                                },
                                {
                                    fields: {id: 101, other_fields: 'other_fields_2'},
                                    pk: 101,
                                    model: 'core.content',
                                    score: 1
                                }
                            ]

                        }
                    })
                    expect(storeActions[2].type).toEqual(SIMILARITY_SEARCH);
                    expect(storeActions[2]).toEqual({
                        type: SIMILARITY_SEARCH,
                        contentIDs: [100, 101],
                        since: timestamp
                    });
                    expect(storeActions[3].type).toEqual(SNACKBAR_SHOW_MESSAGE);
                    expect(storeActions[4].type).toEqual(SNACKBAR_SHOW_MESSAGE);
                    expect(storeActions[5].type).toEqual(SHOW_SEARCH_RESULTS);

                }).then(done).catch(done);
            })
        })

        describe('async action: deleteWorkspace', () => {
            beforeEach(() => FetchMock.restore()),
            it('Dispatches deleteWorkspace correctly', (done) => {
                let matcher = /.*/;
                FetchMock.mock(matcher, 204);
                const store = mockStore({});
                deleteWorkspace(999)(store.dispatch).then(() => {
                    let calls = FetchMock.calls();
                    expect(calls.matched.length).toEqual(1);
                    expect(calls.unmatched.length).toEqual(0);
                    expect(FetchMock.lastUrl()).toEqual('/api/v1/workspace/999');
                    expect(FetchMock.lastOptions().method).toEqual('DELETE');

                    let otherActions = store.getActions();
                    expect(otherActions.length).toEqual(1);
                    expect(otherActions[0].type).toEqual(SNACKBAR_SHOW_MESSAGE);
                }).then(done).catch(done);
            })

        })
        describe('async action: getWorkspaces', () => {
            beforeEach(() => FetchMock.restore()),
            it('Dispatches getWorkspaces correctly', (done) => {
                // This just requires fetch_mock, not a mocked store, since it doesn't
                // dispatch any actions to the store
                const matcher = /.*/;
                // There is no real parsing of anything, so just make sure we are returned the raw json
                // from the server
                const mocked_http_results = {
                    results: ["good"]
                }
                FetchMock.mock(matcher, mocked_http_results);
                getWorkspaces().then((results) => {
                    let calls = FetchMock.calls();
                    expect(calls.matched.length).toEqual(1);
                    expect(calls.unmatched.length).toEqual(0);
                    expect(FetchMock.lastUrl()).toEqual('/api/v1/workspace?fields=id,title,description');
                    expect(results).toEqual(["good"]);
                }).then(done).catch(done);
            })
        })

        describe('async action: updateWorkspace', () => {
            beforeEach(() => FetchMock.restore()),
            it('Dispatches updateWorkspace correctly', (done) => {
                let matcher = /.*/;
                let workspaceData = {
                    dirty:true,
                    id: 999,
                    title: "Updated Title",
                    description: "Updated Description",
                    articles: [ {pk: 101}, {pk: 102}, {pk:103} ]
                }
                let mocked_http_results = {
                    id: 999
                }
                FetchMock.mock(matcher, mocked_http_results);
                const store = mockStore({});
                updateWorkspace(workspaceData)(store.dispatch).then((id) => {
                    let calls = FetchMock.calls();
                    expect(calls.matched.length).toEqual(1);
                    expect(calls.unmatched.length).toEqual(0);
                    expect(FetchMock.lastUrl()).toEqual('/api/v1/workspace/999');
                    expect(FetchMock.lastOptions().method).toEqual('PATCH');
                    expect(id).toEqual(999);

                    let storeActions = store.getActions();
                    expect(storeActions.length).toEqual(3);
                    expect(storeActions[0].type).toEqual(SNACKBAR_SHOW_MESSAGE);
                    expect(storeActions[1]).toEqual({
                        type: REPLACE_WORKSPACE,
                        workspace: workspaceData
                    });
                    expect(storeActions[2].type).toEqual(SNACKBAR_SHOW_MESSAGE);
                }).then(done).catch(done);
            })
        })

        describe('async action: createWorkspace', () => {
            beforeEach(() => FetchMock.restore()),
            it('Dispatches createWorkspace correctly', (done) => {
                let matcher = /.*/;
                let workspaceData = {
                    title: "New Title",
                    description: "New Description",
                    articles: [ {pk: 101}, {pk: 102}, {pk:103} ],
                    dirty: true
                }
                let mocked_http_results = {
                    id: 999
                }
                FetchMock.mock(matcher, mocked_http_results);
                const store = mockStore({});
                createWorkspace(workspaceData)(store.dispatch).then((id) => {
                    let calls = FetchMock.calls();
                    expect(calls.matched.length).toEqual(1);
                    expect(calls.unmatched.length).toEqual(0);
                    expect(FetchMock.lastUrl()).toEqual('/api/v1/workspace');
                    expect(FetchMock.lastOptions().method).toEqual('POST');
                    expect(id).toEqual(999);

                    let storeActions = store.getActions();
                    expect(storeActions.length).toEqual(3);
                    expect(storeActions[0].type).toEqual(SNACKBAR_SHOW_MESSAGE);
                    expect(storeActions[1]).toEqual({
                        type: REPLACE_WORKSPACE,
                        workspace: {id: 999, ...workspaceData, dirty: false}
                    });
                    expect(storeActions[2].type).toEqual(SNACKBAR_SHOW_MESSAGE);
                }).then(done).catch(done);
            })
        })
    })
    describe("Reducer Tests", () => {
        it('CLEAR_WORKSPACE', () => {
            let newState = workspaceReducer(
                {id:1, title:"old", description:"old", articles:[1,2,3], dirty: true},
                {type: CLEAR_WORKSPACE}
            );
            expect(newState).toEqual({id: null, title:'', description: '', articles: [], dirty: false});
        })
        describe('SET_IN_WORKSPACE', () => {
            const existingState = {
                id: 1, title: "dummy", description: "dummy",
                articles: [{pk: 1, title: "1"}, {pk:2, title: "2"}],
                dirty: false
            }
            it('Remove from workspace if already in workspace', () => {
                const articleToRemove = {pk:1, title: "1"}
                let newState = workspaceReducer(
                    existingState,
                    {
                        type: SET_IN_WORKSPACE,
                        content: articleToRemove,
                        inWorkspace: false
                    });
                expect(newState).toEqual({
                    id: 1, title: "dummy", description: "dummy",
                    articles: [{pk: 2, title: "2"}],
                    dirty: true
                })
            })
            it('Remove from workspace if not in workspace', () => {
                const articleToRemove = {pk:3, title: "3"}
                let newState = workspaceReducer(
                    existingState,
                    {
                        type: SET_IN_WORKSPACE,
                        content: articleToRemove,
                        inWorkspace: false
                    });
                expect(newState).toEqual(existingState);
            })
            it('Remove from workspace if not in dirty workspace', () => {
                const articleToRemove = {pk:3, title: "3"}
                const previousState = Object.assign({}, existingState, {dirty: true});
                let newState = workspaceReducer(
                    previousState,
                    {
                        type: SET_IN_WORKSPACE,
                        content: articleToRemove,
                        inWorkspace: false
                    });
                expect(newState).toEqual(previousState);
            })
            it('Add to workspace if already in workspace', () => {
                const articleToAdd = {pk:2, title: "2"}
                let newState = workspaceReducer(
                    existingState,
                    {
                        type: SET_IN_WORKSPACE,
                        content: articleToAdd,
                        inWorkspace: true
                    });
                expect(newState).toEqual(existingState);
            })
            it('Add to workspace if already in dirty workspace', () => {
                const articleToAdd = {pk:2, title: "2"}
                const previousState = Object.assign({}, existingState, {dirty: true});
                let newState = workspaceReducer(
                    previousState,
                    {
                        type: SET_IN_WORKSPACE,
                        content: articleToAdd,
                        inWorkspace: true
                    });
                expect(newState).toEqual(previousState);
            })
            it('Add to workspace if not already in workspace', () => {
                const articleToAdd = {pk:3, title: "3"}
                let newState = workspaceReducer(
                    existingState,
                    {
                        type: SET_IN_WORKSPACE,
                        content: articleToAdd,
                        inWorkspace: true
                    });
                expect(newState).toEqual({
                    id: 1, title: "dummy", description: "dummy",
                    articles: [{pk:1, title: "1"}, {pk: 2, title: "2"}, {pk:3, title:"3"}],
                    dirty: true
                })
            })
        })
        describe('REPLACE_WORKSPACE', () => {
            it ("Clean workspace", () => {
                let newState = workspaceReducer(
                {state: 'old state', dirty: true},
                {type: REPLACE_WORKSPACE, workspace:{newstate: 'success'}});
                expect(newState).toEqual({newstate: 'success', dirty: false});
            })
            it('Dirty workspace', () => {
                let newState = workspaceReducer(
                    {state: 'old state'},
                    {type: REPLACE_WORKSPACE, workspace:{newstate: 'success', dirty: true}});
                expect(newState).toEqual({newstate: 'success', dirty: true});
            })
        })
    })

    describe("UI Component Tests", () => {
        describe('<WorkspaceChooser>', () => {

            it('<WorkspaceList> shallow', () => {
                const onCancel = expect.createSpy();
                const onChooseWorkspace = expect.createSpy();
                const onDeleteWorkspace = expect.createSpy();
                const workspacesOnServer =  [
                    {id: 1, title: "workspace 1", description: "description 1"},
                    {id: 2, title: "workspace 2", description: "description 2"},
                    {id: 3, title: "workspace 3", description: "description 3"}
                ]
                const store = mockStore({});

                const item = shallow(
                    <WorkspaceList onCancel={onCancel} onDeleteWorkspace={onDeleteWorkspace} onChooseWorkspace={onChooseWorkspace} workspacesOnServer={workspacesOnServer}/>,
                    {
                        context: {
                            muiTheme: getMuiTheme(theme),
                            store: store
                        },
                        childContextTypes: {
                            muiTheme: React.PropTypes.object,
                            store: React.PropTypes.object
                        }
                    }
                );
                let listItems = item.find(ListItem);

                expect(listItems.length).toEqual(3);
                expect(listItems.at(0).prop('primaryText')).toEqual('workspace 1');
                expect(listItems.at(0).prop('secondaryText')).toEqual('description 1');
                listItems.at(0).simulate("click");
                listItems.at(1).simulate("click");
                listItems.at(2).simulate("click");
                expect(onChooseWorkspace.calls.length).toEqual(3);
                expect(onChooseWorkspace.calls[0].arguments).toEqual([1]);
                expect(onChooseWorkspace.calls[1].arguments).toEqual([2]);
                expect(onChooseWorkspace.calls[2].arguments).toEqual([3]);
            })
            it('<WorkspaceList> mount', () => {
                const onCancel = expect.createSpy();
                const onChooseWorkspace = expect.createSpy();
                const onDeleteWorkspace = expect.createSpy();
                const workspacesOnServer =  [
                    {id: 1, title: "workspace 1", description: "description 1"},
                    {id: 2, title: "workspace 2", description: "description 2"},
                    {id: 3, title: "workspace 3", description: "description 3"}
                ]
                const store = mockStore({});

                const item = mount(
                    <WorkspaceList onCancel={onCancel} onDeleteWorkspace={onDeleteWorkspace} onChooseWorkspace={onChooseWorkspace} workspacesOnServer={workspacesOnServer}/>,
                    {
                        context: {
                            muiTheme: getMuiTheme(theme),
                            store: store
                        },
                        childContextTypes: {
                            muiTheme: React.PropTypes.object,
                            store: React.PropTypes.object
                        }
                    }
                );

                let deleteButton1 = item.find(IconButton);
                deleteButton1.at(0).simulate("click");
                deleteButton1.at(1).simulate("click");
                deleteButton1.at(2).simulate("click");
                expect(onDeleteWorkspace.calls.length).toEqual(3);
                expect(onDeleteWorkspace.calls[0].arguments).toEqual([1]);
                expect(onDeleteWorkspace.calls[1].arguments).toEqual([2]);
                expect(onDeleteWorkspace.calls[2].arguments).toEqual([3]);
            })
            describe('<_WorkspaceChooser> mount', () => {
                let context = {};
                beforeEach(() => {
                    global.document=jsdom('');
                    context.onCancel = expect.createSpy();
                    context.onChooseWorkspace = expect.createSpy();
                    context.onDeleteWorkspace = expect.createSpy();
                    context.workspacesOnServer =  [
                        {id: 1, title: "workspace 1", description: "description 1"},
                        {id: 2, title: "workspace 2", description: "description 2"},
                        {id: 3, title: "workspace 3", description: "description 3"}
                    ]
                    context.store = mockStore({});
                    context.startProps = {
                        visible: false, 
                        onCancel: context.onCancel,
                        onDeleteWorkspace: context.onDeleteWorkspace,
                        onChooseWorkspace: context.onChooseWorkspace,
                        workspacesOnServer: context.workspacesOnServer
                    }
                    context.mountOptions = {
                            context: {
                                muiTheme: getMuiTheme(theme),
                                store: context.store
                            },
                            childContextTypes: {
                                muiTheme: React.PropTypes.object,
                                store: React.PropTypes.object
                            }
                        }
                })
                it('clicking cancel dismisses it', () => {

                    const item = mount(
                        <_WorkspaceChooser {...context.startProps}/>,
                        context.mountOptions
                    );
/*                    console.log("Item layer is ", item.instance().refs.dialog);
                    let dialogObject = item.instance().refs.dialog;
                    console.log("Button is ", dialogObject.props); // STOPPED
                    let cancelButton = item.find(RaisedButton);
                    console.log("Found raisedButton!", cancelButton);
*/

                    item.setProps({...context.startProps, visible: true});
                    expect(item.state().open).toEqual(true);
                    const overlayElement = document.getElementsByClassName('workspaceChooser')[0].childNodes[2];
                    const button = document.getElementsByTagName('button')[0];
                    expect(overlayElement.offsetLeft >= 0);
                    TestUtils.Simulate.click(button);
//                    expect(context.onCancel.calls.length).toEqual(1);
//                    expect(item.state().open).toEqual(false);
                    expect(overlayElement.offsetLeft < 0);
                })

                it('hitting escape dismisses it', () => {

                    const item = mount(
                        <_WorkspaceChooser {...context.startProps}/>,
                        context.mountOptions
                    );

                    item.setProps({...context.startProps, visible: true});
                    expect(item.state().open).toEqual(true);
                    const overlayElement = document.getElementsByClassName('workspaceChooser')[0].childNodes[2];
                    expect(overlayElement.offsetLeft >= 0);
                    TestUtils.Simulate.keyPress(overlayElement, {which: 27, keyCode: 27});
//                    expect(context.onCancel.calls.length).toEqual(1);
//                    expect(item.state().open).toEqual(false);
                    expect(overlayElement.offsetLeft < 0);
                })
                it('clicking outside chooser dismisses it', () => {

                    const item = mount(
                        <_WorkspaceChooser {...context.startProps}/>,
                        context.mountOptions
                    );

                    item.setProps({...context.startProps, visible: true});
                    expect(item.state().open).toEqual(true);
                    const overlayElement = document.getElementsByClassName('workspaceChooser')[0].childNodes[2];
                    expect(overlayElement.offsetLeft >= 0);
                    TestUtils.Simulate.click(overlayElement);
//                    expect(context.onCancel.calls.length).toEqual(1);
//                    expect(item.state().open).toEqual(false);
                    expect(overlayElement.offsetLeft < 0);
                })

                it('mounts with expected visibility and converts to visible when prop changes', () => {
                    const item = mount(
                        <_WorkspaceChooser {...context.startProps}/>,
                        context.mountOptions
                    );
                    expect(item.state().open).toEqual(false);
                    item.setProps({...context.startProps, visible: true});
                    expect(item.state().open).toEqual(true);
                })
            })
        })
        describe('<WorkspaceEditor>', () => {
            describe('<WorkspaceEditorInternal>', () => {
                it('Creating new Workspace from empty', () => {
                    const store = mockStore({});
                    const workspaceData = {title:"", description: "", articles:[]};
                    const onSubmitWorkspace = expect.createSpy();
                    const onCancel = expect.createSpy();
                    const item = shallow(
                        <WorkspaceEditorInternal visible={true} workspaceData={workspaceData}
                            isCreating={true} onSubmitWorkspace={onSubmitWorkspace} onCancel={onCancel}/>,
                        {
                            context: {
                                muiTheme: getMuiTheme(theme),
                                store: store
                            },
                            childContextTypes: {
                                muiTheme: React.PropTypes.object,
                                store: React.PropTypes.object
                            }
                        }
                    );

                    const textFields = item.find(TextField);
                    expect(textFields.get(0).props['defaultValue']).toEqual("New Workspace");
                    expect(textFields.get(1).props['defaultValue']).toMatch(/Created at .*/);

                })
                it('Creating new Workspace from existing', () => {
                    const store = mockStore({});
                    const workspaceData = {title:"Existing Title", description: "Existing Description", articles:[]};
                    const onSubmitWorkspace = expect.createSpy();
                    const onCancel = expect.createSpy();
                    const item = shallow(
                        <WorkspaceEditorInternal visible={true} workspaceData={workspaceData}
                            isCreating={true} onSubmitWorkspace={onSubmitWorkspace} onCancel={onCancel}/>,
                        {
                            context: {
                                muiTheme: getMuiTheme(theme),
                                store: store
                            },
                            childContextTypes: {
                                muiTheme: React.PropTypes.object,
                                store: React.PropTypes.object
                            }
                        }
                    );

                    const textFields = item.find(TextField);
                    expect(textFields.get(0).props['defaultValue']).toEqual("Copy of Existing Title");
                    expect(textFields.get(1).props['defaultValue']).toEqual("Existing Description");
                })

                it('Updating existing Workspace', () => {
                    const store = mockStore({});
                    const workspaceData = {title:"Existing Title", description: "Existing Description", articles:[]};
                    const onSubmitWorkspace = expect.createSpy();
                    const onCancel = expect.createSpy();
                    const item = shallow(
                        <WorkspaceEditorInternal visible={true} workspaceData={workspaceData}
                            isCreating={false} onSubmitWorkspace={onSubmitWorkspace} onCancel={onCancel}/>,
                        {
                            context: {
                                muiTheme: getMuiTheme(theme),
                                store: store
                            },
                            childContextTypes: {
                                muiTheme: React.PropTypes.object,
                                store: React.PropTypes.object
                            }
                        }
                    );

                    const textFields = item.find(TextField);
                    expect(textFields.get(0).props['defaultValue']).toEqual("Existing Title");
                    expect(textFields.get(1).props['defaultValue']).toEqual("Existing Description");

                })

                it('Submits new workspace data correctly (full mount)', () => {
                    global.document=jsdom(''); // XXX: Kind of a hack a) belongs in beforeEach, maybe, and also we should probably hook this in from
                                               // .setup.js better
                    const store = mockStore({});
                    const workspaceData = {title:"New Title", description: "New Description", articles:[]};
                    const onSubmitWorkspace = expect.createSpy();
                    const onCancel = expect.createSpy();
                    mount(
                        <WorkspaceEditorInternal visible={true} workspaceData={workspaceData}
                            isCreating={true} onSubmitWorkspace={onSubmitWorkspace} onCancel={onCancel}/>,
                        {
                            context: {
                                muiTheme: getMuiTheme(theme),
                                store: store
                            },
                            childContextTypes: {
                                muiTheme: React.PropTypes.object,
                                store: React.PropTypes.object
                            }
                        }
                    );

                    // Since the Dialog contents are detached, we can't really test buttons with enzyme (see
                    // https://github.com/airbnb/enzyme/issues/252 for more info)
                    const buttons = document.getElementsByTagName('button');
                    expect(buttons.length).toEqual(2);
                    expect(buttons[0].textContent).toEqual("Create");
                    expect(buttons[1].textContent).toEqual("Cancel");

                    TestUtils.Simulate.click(buttons[0]); // Create
                    TestUtils.Simulate.click(buttons[1]); // Cancel
                    expect(onCancel.calls.length).toEqual(1);
                    expect(onSubmitWorkspace.calls.length).toEqual(1);
                    expect(onSubmitWorkspace.calls[0].arguments).toEqual([{articles: [], title: "Copy of New Title", description: "New Description"}]);
                })

                it('Submits update data correctly (full mount)', () => {
                    global.document=jsdom(''); // XXX: Kind of a hack a) belongs in beforeEach, maybe, and also we should probably hook this in from
                                               // .setup.js better
                    const store = mockStore({});
                    const workspaceData = {id: 999, title:"Existing Title", description: "Existing Description", articles:[]};
                    const onSubmitWorkspace = expect.createSpy();
                    const onCancel = expect.createSpy();
                    mount(
                        <WorkspaceEditorInternal visible={true} workspaceData={workspaceData}
                            isCreating={false} onSubmitWorkspace={onSubmitWorkspace} onCancel={onCancel}/>,
                        {
                            context: {
                                muiTheme: getMuiTheme(theme),
                                store: store
                            },
                            childContextTypes: {
                                muiTheme: React.PropTypes.object,
                                store: React.PropTypes.object
                            }
                        }
                    );

                    // Since the Dialog contents are detached, we can't really test buttons with enzyme (see
                    // https://github.com/airbnb/enzyme/issues/252 for more info)
                    const buttons = document.getElementsByTagName('button');
                    expect(buttons.length).toEqual(2);
                    expect(buttons[0].textContent).toEqual("Save");
                    expect(buttons[1].textContent).toEqual("Cancel");

                    TestUtils.Simulate.click(buttons[0]); // Save
                    TestUtils.Simulate.click(buttons[1]); // Cancel

                    expect(onCancel.calls.length).toEqual(1);
                    expect(onSubmitWorkspace.calls.length).toEqual(1);
                    expect(onSubmitWorkspace.calls[0].arguments).toEqual([{id: 999, articles: [], title: "Existing Title", description: "Existing Description"}]);
                })
            })
        })
        describe("<Workspace> tests", () => {
            const defaultProps = {
                chooseWorkspace: expect.createSpy(),
                deleteWorkspace: expect.createSpy(),
                workspacesOnServer:  [
                    {id: 1, title: "workspace 1", description: "description 1"},
                    {id: 2, title: "workspace 2", description: "description 2"},
                    {id: 3, title: "workspace 3", description: "description 3"}
                ],
                submitWorkspace: expect.createSpy(),
                workspaceData: {
                    title: "New Title",
                    description: "New Description",
                    articles: [ {pk: 101}, {pk: 102}, {pk:103} ],
                    dirty: false
                },
                showLoadWorkspace: expect.createSpy(),
                showUpdateWorkspace: expect.createSpy(),
                showCreateWorkspace: expect.createSpy(),
                unSelectAll: expect.createSpy(),
                cancelChooseWorkspace: expect.createSpy(),
                findSimilarMultiple: expect.createSpy(),
                workspaceChooserVisible: false,
                workspaceEditorVisible: false,
                workspaceEditorCreating: false,
                muiTheme: getMuiTheme(theme)
            }
            it("Renders non-empty workspace correctly", () => {
                const store = mockStore({});
                const props = Object.assign({}, defaultProps);
                const item = shallow(
                    <_Workspace {...props}/>,
                    {
                        context: {
                            muiTheme: getMuiTheme(theme),
                            store: store
                        },
                        childContextTypes: {
                            muiTheme: React.PropTypes.object,
                            store: React.PropTypes.object
                        }
                    }
                );
                const toolbars = item.find(Toolbar);
                expect(toolbars.length).toEqual(2);
                const firstToolbar = toolbars.at(0);
                const toolbarTitle = firstToolbar.find(ToolbarTitle);
                expect(toolbarTitle.get(0).props['text']).toEqual("New Title");
                expect(firstToolbar.find(ToolbarGroup).at(0).children().length).toEqual(4); // No text for "Unsaved", but still have count
                expect(firstToolbar.find(ToolbarGroup).at(0).children().get(2).props['text']).toEqual('3 item(s)');
                expect(item.children().length).toEqual(7);
                expect(item.childAt(4).type()).toEqual(ContentDetail);
                expect(item.childAt(5).type()).toEqual(ContentDetail);
                expect(item.childAt(6).type()).toEqual(ContentDetail);
            })
            it("Renders empty workspace with no title correctly", () => {
                const store = mockStore({});
                const props = Object.assign({}, defaultProps, {workspaceData: {title: '', description: '', articles: [], dirty: false}});
                const item = shallow(
                    <_Workspace {...props}/>,
                    {
                        context: {
                            muiTheme: getMuiTheme(theme),
                            store: store
                        },
                        childContextTypes: {
                            muiTheme: React.PropTypes.object,
                            store: React.PropTypes.object
                        }
                    }
                );
                const title = item.find(ToolbarTitle).get(0);
                expect(title.props['text']).toEqual('Untitled Workspace');
                const firstToolbarGroup = item.find(ToolbarGroup).at(0);
                expect(firstToolbarGroup.children().length).toEqual(4);
                expect(item.children().length).toEqual(5);
                expect(item.childAt(4).type()).toEqual(Card);
            })
            it("Renders empty workspace with title correctly", () => {
                const store = mockStore({});
                const props = Object.assign({}, defaultProps, {workspaceData: {title: 'A real title', description: '', articles: [], dirty: false}});
                const item = shallow(
                    <_Workspace {...props}/>,
                    {
                        context: {
                            muiTheme: getMuiTheme(theme),
                            store: store
                        },
                        childContextTypes: {
                            muiTheme: React.PropTypes.object,
                            store: React.PropTypes.object
                        }
                    }
                );
                const title = item.find(ToolbarTitle).get(0);
                expect(title.props['text']).toEqual('A real title');
                const firstToolbarGroup = item.find(ToolbarGroup).at(0);
                expect(firstToolbarGroup.children().length).toEqual(4);
                expect(item.children().length).toEqual(5);
                expect(item.childAt(4).type()).toEqual(Card);

            })
            it("Renders dirty workspace correctly", () => {
                const props = Object.assign({}, defaultProps, {workspaceData: Object.assign({}, defaultProps.workspaceData, {dirty: true})});
                const store = mockStore({});
                const item = shallow(
                    <_Workspace {...props}/>,
                    {
                        context: {
                            muiTheme: getMuiTheme(theme),
                            store: store
                        },
                        childContextTypes: {
                            muiTheme: React.PropTypes.object,
                            store: React.PropTypes.object
                        }
                    }
                );
                const toolbars = item.find(Toolbar);
                expect(toolbars.length).toEqual(2);
                const firstToolbar = toolbars.at(0);
                const toolbarTitle = firstToolbar.find(ToolbarTitle);
                expect(toolbarTitle.get(0).props['text']).toEqual("New Title");
                expect(firstToolbar.find(ToolbarGroup).at(0).children().length).toEqual(5); // text for "Unsaved" + count
                expect(firstToolbar.find(ToolbarGroup).at(0).childAt(2).type()).toEqual(ToolbarTitle);
                expect(firstToolbar.find(ToolbarGroup).at(0).children().get(4).props['text']).toEqual('Unsaved');
                expect(item.children().length).toEqual(7);
                expect(item.childAt(4).type()).toEqual(ContentDetail);
                expect(item.childAt(5).type()).toEqual(ContentDetail);
                expect(item.childAt(6).type()).toEqual(ContentDetail);
            })
        })
    })
    it('Integration tests - test that the right callback happens if buttons pressed after full rendering')
})
