import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import expect from 'expect' 
import FetchMock from 'fetch-mock'

import {SNACKBAR_SHOW_MESSAGE} from '../assets/js/actions/snackbar-actions'
import {keywordSearch, ADD_SEARCH_RESULTS} from '../assets/js/actions/search-actions'

//XXX: See https://github.com/wheresrhys/fetch-mock/issues/46 about fetch-mock, isomorphic-fetch, etc

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

describe('async action: keywordSearch', () => {
    afterEach(() => FetchMock.reset()),

    it ('Calls search query', (done) => {
        const mocked_http_results = 
        {
            hits : {
                hits: [{_score:1, _source:{field_one:1}}, {_score:2,_source:{field_one: 2}}],
                totalCount: 2
            },
        }

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
            body: mocked_http_results,
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
