import React from 'react'
import {connect} from 'react-redux'

import {Link} from 'react-router'
import {acceptGroupRequest, rejectGroupRequest,
        acceptUserRequest, rejectUserRequest} from '../redux/action-creators'
import {tileUserListFactory, WITH_REQUEST_HANDLES} from './tile-user-list'
const TileList = tileUserListFactory({type: WITH_REQUEST_HANDLES})

const renderRequestsToGroup = (accept, reject) => (groupRequests) => {
  const acceptGroupRequest = (userName) => accept(groupRequests.username, userName)
  const rejectGroupRequest = (userName) => reject(groupRequests.username, userName)

  return (
    <div key={groupRequests.id}>
      <h3>{groupRequests.screenName}</h3>
      <TileList users={groupRequests.requests}
                       acceptRequest={acceptGroupRequest}
                       rejectRequest={rejectGroupRequest}/>
    </div>
  )
}

const RequestsHandler = (props) => {
  const groupRequests = props.groupRequests.map(renderRequestsToGroup(props.acceptGroupRequest, props.rejectGroupRequest))

  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        <div><Link to={`/${props.username}`}>{props.username}</Link> › Requests</div>
        <div>
          {props.feedRequests
          ? <div>
              <h3>Requests to your feed</h3>
              <TileList users={props.feedRequests}
                        acceptRequest={props.acceptUserRequest}
                        rejectRequest={props.rejectUserRequest}/>
            </div>
          : false}

          {groupRequests
          ? <div>
              {groupRequests}
            </div>
          : false}
        </div>
      </div>
      <div className='box-footer'></div>
    </div>
  )
}

function selectState(state) {
  const selectedState = {}
  
  selectedState.boxHeader = state.boxHeader
  selectedState.username = state.router.params.userName

  const feedRequests = state.requests
  if (feedRequests && feedRequests.length != 0) {
    selectedState.feedRequests = feedRequests
  }

  const groupRequests = state.groupRequests.filter(group => group.requests.length != 0)
  if (groupRequests) {
    selectedState.groupRequests = groupRequests
  }

  return selectedState
}

function selectActions(dispatch) {
  return {
    acceptGroupRequest: (...args) => dispatch(acceptGroupRequest(...args)),
    rejectGroupRequest: (...args) => dispatch(rejectGroupRequest(...args)),
    acceptUserRequest: (...args) => dispatch(acceptUserRequest(...args)),
    rejectUserRequest: (...args) => dispatch(rejectUserRequest(...args))
  }
}

export default connect(selectState, selectActions)(RequestsHandler)
