import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'

import {preventDefault} from '../utils'
import * as FrontendPrefsOptions from '../utils/frontend-preferences-options'

const DisplayOption = ({user, me, preferences}) => {
  if (user.username === me && preferences.useYou) {
    return <span>You</span>
  }

  if (user.screenName === user.username) {
    return <span>{user.screenName}</span>
  }

  switch (preferences.displayOption) {
    case FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME: {
      return <span>{user.screenName}</span>
    }
    case FrontendPrefsOptions.DISPLAYNAMES_BOTH: {
      return <span>{user.screenName} ({user.username})</span>
    }
    case FrontendPrefsOptions.DISPLAYNAMES_USERNAME: {
      return <span>{user.username}</span>
    }
  }

  return <span>{user.screenName}</span>
}

const UserName = (props) => (
  <Link to={`/${props.user.username}`} className={`user-name-info ${props.className}`}>
    {props.display ? (
      <span>{props.display}</span>
    ) : (
      <DisplayOption
        user={props.user}
        me={props.me}
        preferences={props.frontendPreferences.displayNames}/>
    )}
  </Link>
)

const mapStateToProps = (state) => {
  return {
    me: state.user.username,
    frontendPreferences: state.user.frontendPreferences
  }
}

export default connect(mapStateToProps)(UserName)
