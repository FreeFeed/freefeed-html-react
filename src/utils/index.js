export function getCookie(name){
  const begin = document.cookie.indexOf(name)
  if (begin === -1){
    return ''
  }
  const fromBegin = document.cookie.substr(begin)
  const tokenWithName = fromBegin.split(';')
  const tokenWithNameSplit = tokenWithName[0].split('=')
  const token = tokenWithNameSplit[1]
  return token.trim()
}

export function setCookie(name, value = '', expireDays, path) {
  const expiresDate = Date.now() + expireDays * 24 * 60 * 60 * 1000
  const expiresTime = new Date(expiresDate).toUTCString()
  //http://stackoverflow.com/questions/1134290/cookies-on-localhost-with-explicit-domain
  const cookie = `${name}=${value}; expires=${expiresTime}; path=${path}`
  return document.cookie = cookie
}

import moment from 'moment'

export function fromNowOrNow(date) {
  var now = moment(date)

  if (Math.abs(moment().diff(now)) < 1000) { // 1000 milliseconds
    return 'just now'
  }

  return now.fromNow()
}

import defaultUserpic50Path from 'assets/images/default-userpic-50.png'
import defaultUserpic75Path from 'assets/images/default-userpic-75.png'

const userDefaults = {
  profilePictureMediumUrl: defaultUserpic50Path,
  profilePictureLargeUrl: defaultUserpic75Path,
}

export function userParser(user) {
  user.profilePictureMediumUrl = user.profilePictureMediumUrl || userDefaults.profilePictureMediumUrl
  user.profilePictureLargeUrl = user.profilePictureLargeUrl || userDefaults.profilePictureLargeUrl
  return {...user}
}

export function postParser(post) {
  post.commentsDisabled = (post.commentsDisabled === '1')
  return {...post}
}

export function preventDefault(realFunction) {
  return (event) => {
    event.preventDefault()
    return realFunction && realFunction()
  }
}

export function confirmFirst(realFunction) {
  return () => {
    if (confirm('Are you sure?')) {
      return realFunction && realFunction()
    }
  }
}

export function getCurrentRouteName(router) {
  return router && router.routes[router.routes.length - 1].name
}
