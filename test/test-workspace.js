import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import expect from 'expect'
import FetchMock from 'fetch-mock'
import {CLEAR_WORKSPACE, SET_IN_WORKSPACE, REPLACE_WORKSPACE, clearWorkspace, setInWorkspace, loadWorkspace, getWorkspaces,
    updateWorkspace, createWorkspace} from '../assets/js/actions/workspace-actions';
import {SNACKBAR_SHOW_MESSAGE} from '../assets/js/actions/snackbar-actions'
import {workspaceReducer} from '../assets/js/reducers/workspace-reducer'

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);


/*
 * Test plan:
 *
 * ACTIONS:
 * 1) clearWorkspace X
 * 2) setIntoWorkspace X
 * 3) loadWorkspace X
 * 4) getWorkspaces X
 * 5) updateWorkspace X
 * 6) createWorkspace
 *
 * REDUCER EVENTS:
 * 1) CLEAR_WORKSPACE
 * 2) SET_IN_WORKSPACE
 * a) Remove from workspace if already in workspace
 * b) Remove from workspace is not in workspace
 * c) Add to workspace if already in workspace
 * d) Add to workspace if not already in workspace
 * 3) REPLACE_WORKSPACE
 *
 * UI COMPONENTS:
 * 1) WorkspaceChooser
 * 2) WorkspaceEditor
 * a) Creating new Workspace
 * b) Updating existing Workspace
 * 3) Workspace-related Master functionality (encourage refactoring)
 *
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
                    ]
                }
                FetchMock.mock(matcher, mocked_http_results);
                const store = mockStore({});
                loadWorkspace(678)(store.dispatch).then(() => {
                    let calls = FetchMock.calls();
                    expect(calls.matched.length).toEqual(1);
                    expect(calls.unmatched.length).toEqual(0);
                    expect(FetchMock.lastUrl()).toEqual('/api/v1/workspace/678');

                    let storeActions = store.getActions();
                    expect(storeActions.length).toEqual(2);
                    expect(storeActions[0]).toEqual( {
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
                    expect(storeActions[1].type).toEqual(SNACKBAR_SHOW_MESSAGE);

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
                    articles: [ {pk: 101}, {pk: 102}, {pk:103} ]
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
                        workspace: {id: 999, ...workspaceData}
                    });
                    expect(storeActions[2].type).toEqual(SNACKBAR_SHOW_MESSAGE);
                }).then(done).catch(done);
            })
        })
    })
    describe("Reducer Tests", () => {
        it('CLEAR_WORKSPACE', () => {
            let newState = workspaceReducer(
                {id:1, title:"old", description:"old", articles:[1,2,3]},
                {type: CLEAR_WORKSPACE}
            );
            expect(newState).toEqual({id: null, title:'', description: '', articles: []});
        })
        describe('SET_IN_WORKSPACE', () => {
            const existingState = {
                id: 1, title: "dummy", description: "dummy",
                articles: [{pk: 1, title: "1"}, {pk:2, title: "2"}]
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
                    articles: [{pk: 2, title: "2"}]
                })
            })
            it('Remove from workspace is not in workspace', () => {
                const articleToRemove = {pk:3, title: "3"}
                let newState = workspaceReducer(
                    existingState,
                    {
                        type: SET_IN_WORKSPACE,
                        content: articleToRemove,
                        inWorkspace: false
                    });
                expect(newState).toEqual({ 
                    id: 1, title: "dummy", description: "dummy", 
                    articles: [{pk:1, title: "1"}, {pk: 2, title: "2"}]
                })
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
                expect(newState).toEqual({ 
                    id: 1, title: "dummy", description: "dummy", 
                    articles: [{pk:1, title: "1"}, {pk: 2, title: "2"}]
                })
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
                    articles: [{pk:1, title: "1"}, {pk: 2, title: "2"}, {pk:3, title:"3"}]
                })
            })
        })
        it('REPLACE_WORKSPACE', () => {
            let newState = workspaceReducer(
                {state: 'old state'}, 
                {type: REPLACE_WORKSPACE, workspace:{newstate: 'success'}});
            expect(newState).toEqual({newstate: 'success'});
        })
    })

    describe("UI Component Tests", () => {
        it('WorkspaceChooser')
        describe('WorkspaceEditor', () => {
            it('Creating new Workspace')
            it('Updating existing Workspace')
        })
        it('Workspace-related Master functionality (encourage refactoring)')
    })
})
