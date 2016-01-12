import React from 'react'
import {connect} from 'react-redux'
import {createPost, expandSendTo} from '../redux/action-creators'
import {joinPostData, joinCreatePostData, postActions, userActions} from './select-utils'
import {getQuery, getCurrentRouteName} from '../utils'

import CreatePost from './create-post'
import HomeFeed from './home-feed'
import PaginatedView from './paginated-view'
import UserProfile from './user-profile'
import Breadcrumbs from './breadcrumbs'

const UserFeedHandler = (props) => {
  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        {props.breadcrumbs.shouldShowBreadcrumbs ? <Breadcrumbs {...props.breadcrumbs}/> : false}
        <UserProfile
          {...props.viewUser}
          {...props.userActions}
          user={props.user}
          sendTo={props.sendTo}
          expandSendTo={props.expandSendTo}
          createPostViewState={props.createPostViewState}
          createPost={props.createPost}
          createPostForm={props.createPostForm}
          addAttachmentResponse={props.addAttachmentResponse}/>
      </div>
      {props.viewUser.blocked ?
        false :
        <PaginatedView>
          <HomeFeed {...props} isInUserFeed={true}/>
        </PaginatedView>}
      <div className='box-footer'>
      </div>
    </div>)
}

function selectState(state) {
  const user = state.user
  const feed = state.feedViewState.feed.map(joinPostData(state))
  const createPostViewState = state.createPostViewState
  const createPostForm = joinCreatePostData(state)
  const timelines = state.timelines
  const boxHeader = state.boxHeader
  const foundUser = Object.getOwnPropertyNames(state.users)
  .map(key => state.users[key] || state.subscribers[key])
  .filter(user => user.username === state.router.params.userName)[0]

  const statusExtension = {
    me: !foundUser || foundUser.username === user.username,
    subscribed: foundUser && user.subscriptions.indexOf(foundUser.id) !== -1,
    blocked: foundUser && user.banIds.indexOf(foundUser.id) > -1,
  }

  const viewUser = {...(foundUser || state.user), ...statusExtension}

  const currentRouteName = getCurrentRouteName(state.router)

  const shouldShowBreadcrumbs = ['userComments', 'userLikes'].indexOf(currentRouteName) !== -1

  const breadcrumbs = {
    shouldShowBreadcrumbs,
    user: viewUser,
    breadcrumb: currentRouteName.replace('user','')
  }

  const sendTo = state.sendTo

  return { feed, user, timelines, createPostViewState, createPostForm, boxHeader, viewUser, breadcrumbs, sendTo }
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (feeds, postText, attachmentIds, more) => dispatch(createPost(feeds, postText, attachmentIds, more)),
    expandSendTo: () => dispatch(expandSendTo()),
    userActions: userActions(dispatch),
  }
}

export default connect(selectState, selectActions)(UserFeedHandler)
