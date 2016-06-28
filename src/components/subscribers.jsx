import React from 'react';
import {connect} from 'react-redux';

import {Link} from 'react-router';
import SubsList from './subs-list';
import {getUserInfo} from '../redux/action-creators';

class SubscribersHandler extends React.Component {
  constructor(props) {
    super(props);
    if (!props.thisUser) {
      setTimeout(() => props.getUserInfo(props.username), 0);
    }
  }

  render() {
    const props = this.props;
    return (
      <div className='box'>
        <div className='box-header-timeline'>
          {props.boxHeader}
        </div>
        <div className='box-body'>
          <div className="row">
            <div className="col-md-6">
              <Link to={`/${props.username}`}>{props.username}</Link> › Subscribers
            </div>
            {props.amIGroupAdmin
            ? <div className="col-md-6 text-right">
                <Link to={`/${props.username}/manage-subscribers`}>Manage subscribers</Link>
              </div>
            : false}          
          </div>
          <SubsList {...props} title='Subscribers' />
        </div>
        <div className='box-footer'></div>
      </div>
    );
  }
}

function selectState(state, ownProps) {
  const boxHeader = state.boxHeader;
  const username = ownProps.params.userName;
  const isPending = state.usernameSubscribers.isPending;
  const errorString = state.usernameSubscribers.errorString;
  const amIGroupAdmin = (state.managedGroups.find(group => group.username == username) != null);
  
  const thisUser = [..._.values(state.users), ..._.values(state.groups)].find(u => u.username == username);
  const thisIsGroup = thisUser && thisUser.type === 'group';
  const adminIds = thisIsGroup ? thisUser.administrators : [];
  
  const listSections = [
    {title: thisIsGroup ? 'Members' : null, users: []},
    {title: 'Admins', users: []}
  ];
  
  _.sortBy(state.usernameSubscribers.payload, 'username')
    .forEach(u => {
      const isAdmin = adminIds.some(id => id === u.id);
      listSections[isAdmin ? 1 : 0].users.push(u);
    });

  return { boxHeader, username, amIGroupAdmin, thisUser, listSections, showSectionsTitles: true, isPending, errorString };
}

function mapDispatchToProps(dispatch) {
  return {
    getUserInfo: (username) => dispatch(getUserInfo(username))
  };
}

export default connect(selectState, mapDispatchToProps)(SubscribersHandler);
