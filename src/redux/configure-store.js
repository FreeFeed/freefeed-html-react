import {compose, createStore, applyMiddleware, combineReducers} from 'redux';
import {createHistory, createHashHistory} from 'history';

import {
  apiMiddleware,
  authMiddleware,
  likesLogicMiddleware,
  userPhotoLogicMiddleware,
  groupPictureLogicMiddleware,
  redirectionMiddleware,
  requestsMiddleware,
  realtimeMiddleware,
  dataFixMiddleware
} from './middlewares';

import {routerReducer} from 'react-router-redux';
import * as reducers from './reducers';

//order matters — we need to stop unauthed async fetching before request, see authMiddleware
const middleware = [
  authMiddleware,
  apiMiddleware,
  dataFixMiddleware,
  likesLogicMiddleware,
  userPhotoLogicMiddleware,
  groupPictureLogicMiddleware,
  redirectionMiddleware,
  requestsMiddleware,
  realtimeMiddleware
];

const isDevelopment = process.env.NODE_ENV != 'production';

let enhancers = [applyMiddleware(...middleware),];

//tells webpack to include devtool enhancer in dev mode
if (isDevelopment && window.devToolsExtension) {
  enhancers.push(window.devToolsExtension());
}

const storeEnhancer = compose(...enhancers);

const createStoreWithMiddleware = storeEnhancer(createStore);
const reducer = combineReducers({...reducers, routing: routerReducer});

export default function configureStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState);
}
