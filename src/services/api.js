import fetch from 'isomorphic-fetch'
import {getToken} from './auth'
import {api as apiConfig} from '../config'

const getRequestOptions = () => ({
  headers:{
    'Accept': 'application/json',
    'X-Authentication-Token': getToken()
  }
})

export function getWhoAmI(){
  return fetch(`${apiConfig.host}/v1/users/whoami`, getRequestOptions())
}

export function getHome({offset}) {
  return fetch(
    `${apiConfig.host}/v1/timelines/home?offset=${offset}`, getRequestOptions())
}

const MAX_COMMENTS = 2

export function getLikesOnly({postId, commentsExpanded}) {
  const maxComments = commentsExpanded ? 'all' : `${MAX_COMMENTS}`
  return fetch(
    `${apiConfig.host}/v1/posts/${postId}?maxComments=${maxComments}&maxLikes=all`, getRequestOptions())
}

export function getPostWithAllCommentsAndLikes({postId}) {
  return fetch(
    `${apiConfig.host}/v1/posts/${postId}?maxComments=all&maxLikes=all`, getRequestOptions())
}

export function updatePost({postId, newPost}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({post: newPost})
  })
}

export function deletePost({postId}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}`, {
    'method': 'DELETE',
    'headers': {
      'Accept': 'application/json',
      'X-Authentication-Token': getToken()
    }
  })
}

export function addComment({postId, commentText}){
  return fetch(`${apiConfig.host}/v1/comments`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({comment: {body:commentText, postId}})
  })
}

export function updateComment({commentId, newCommentBody}) {
  return fetch(`${apiConfig.host}/v1/comments/${commentId}`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({comment: {body: newCommentBody}})
  })
}

export function deleteComment({commentId}) {
  return fetch(`${apiConfig.host}/v1/comments/${commentId}`, {
    'method': 'DELETE',
    'headers': {
      'Accept': 'application/json',
      'X-Authentication-Token': getToken()
    }
  })
}

export function createPost({postText, feedName}) {
  return fetch(`${apiConfig.host}/v1/posts`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({
      post: { body: postText},
      meta: { feeds: feedName}
    })
  })
}

export function likePost({postId}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/like`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': '{}'
  })
}

export function unlikePost({postId}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/unlike`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': '{}'
  })
}

export function signIn({username, password}){
  return fetch(`${apiConfig.host}/v1/session`, {
    headers:{
      'Accept': 'application/json',
      'Content-Type':'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: `username=${username}&password=${password}`,
  })
}

export function updateUser({id, screenName, email, isPrivate}) {
  return fetch(`${apiConfig.host}/v1/users/${id}`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({user: {screenName, email, isPrivate}})
  })
}

export function updatePassword({currentPassword, password, passwordConfirmation}){
  return fetch(`${apiConfig.host}/v1/users/updatePassword`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type':'application/x-www-form-urlencoded',
      'X-Authentication-Token': getToken()
    },
    'body': `password=${password}&passwordConfirmation=${passwordConfirmation}&currentPassword=${currentPassword}`
  })
}

export function updateProfilePicture({picture}){
  let data = new FormData()
  data.append('file', picture)

  return fetch(`${apiConfig.host}/v1/users/updateProfilePicture`, {
    'method': 'POST',
    'headers': {
      'X-Authentication-Token': getToken()
    },
    'body': data
  })
}
