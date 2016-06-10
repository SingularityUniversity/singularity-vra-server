import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import expect from 'expect'
import FetchMock from 'fetch-mock'

import {SNACKBAR_SHOW_MESSAGE} from '../assets/js/actions/snackbar-actions'
import {keywordSearch, ADD_SEARCH_RESULTS} from '../assets/js/actions/search-actions'
import {searchReducer, initialState} from '../assets/js/reducers/search-reducer'

//XXX: See https://github.com/wheresrhys/fetch-mock/issues/46 about fetch-mock, isomorphic-fetch, etc

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);
const mocked_http_results =
    {
        hits : {
            hits: [{_score:1, _source:{field_one:1}}, {_score:2,_source:{field_one: 2}}],
            totalCount: 2
        }
    }

describe('async action: keywordSearch', () => {
    beforeEach(() => FetchMock.reset()),

    it ('Calls search query', (done) => {

        const expected_results =
            [
                {
                    score:1,
                    field_one: 1
                },
                {
                    score:2,
                    field_one: 2
                }];
        const expectedActions =
            [
                {
                    type: SNACKBAR_SHOW_MESSAGE
                },
                {
                    type: ADD_SEARCH_RESULTS,
                    results: expected_results,
                    start:0,
                    totalCount: mocked_http_results.total,
                    resultTopics: []
                }
            ];

        let matcher = /.*/;
        FetchMock.mock(matcher, {
            body: mocked_http_results
        });

        const store = mockStore({});

        keywordSearch('test', 0, 50)(store.dispatch).then(() => {
            let storeActions = store.getActions();
            expect(storeActions[0].type).toEqual(expectedActions[0].type);
            expect(store.getActions()[1]).toEqual(expectedActions[1]);
            expect(FetchMock.lastUrl(matcher.toString())).toEqual('/api/v1/search?q=test&offset=0&limit=50');
        }).then(done).catch(done);
    })
})

describe('reducer: keywordSearch', () => {
    it('Returns initial state', () => {
        expect(searchReducer(undefined, {})).toEqual({history: {present: initialState}, present: initialState});
    }),
    it('Sets state to expected value for offset 0', () => {
        const expected_docs =
            [
                {
                    score:0,
                    field_one: 0
                },
                {
                    score:1,
                    field_one: 1
                }];

        const testedAction = {
            type: ADD_SEARCH_RESULTS,
            results: expected_docs,
            start:0,
            totalCount: expected_docs.length,
            resultTopics: []
        }
        const expectedState = {
            searchResultData: expected_docs,
            searchResultTopics: [],
            searchResultTotalCount: expected_docs.length,
            searchContentIDs: [],
            searchText: "",
            searchType: ""
        }

        expect(searchReducer(
            {history: {present: initialState}, present: initialState},
            testedAction).present).
        toEqual(expectedState);
    }),

    it('Sets state to expected value for offset > 0', () => {
        const expected_docs =
            [
                {
                    score: 5,
                    field_one: 5
                },
                {
                    score: 6,
                    field_one: 6
                }];

        const testedAction = {
            type: ADD_SEARCH_RESULTS,
            results: expected_docs,
            start:5,
            totalCount: 7,
            resultTopics: []
        }
        const expectedState = {
            searchResultData: [{score:0, field_one:0},{score:1, field_one:1},null, null, null, ...expected_docs],
            searchResultTopics: [],
            searchResultTotalCount: 7,
            searchContentIDs: [],
            searchText: "",
            searchType: ""
        }
        let prevState = Object.assign({},initialState);
        prevState.searchResultData = [{score:0, field_one:0},{score:1, field_one:1},null, null, null];
        expect(searchReducer(
            {history: {present: prevState}, present: prevState},
            testedAction).present).
        toEqual(expectedState);
    })


})
// XXX: There is some very wonky behavior with the history object (circular reference?) with react-undo. Should test undo/history as well regardless
