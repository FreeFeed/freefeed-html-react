import React from 'react';
import { connect } from 'react-redux';
import { xor, trim } from 'lodash';
import propTypes from 'prop-types';
import { faUsers, faHome } from '@fortawesome/free-solid-svg-icons';
import { Icon } from './fontawesome-icons';
import { lazyComponent } from './lazy-component';

const MY_FEED_LABEL = 'My feed';

const Select = lazyComponent(
  async ({ fixedOptions }) => {
    const m = await import('react-select');
    return fixedOptions ? m : { default: m.Creatable };
  },
  {
    fallback: <div>Loading selector...</div>,
    errorMessage: "Couldn't load the selector",
  },
);

class SendTo extends React.Component {
  static propTypes = {
    isDirects: propTypes.bool,
    isEditing: propTypes.bool,
    excludeMyFeed: propTypes.bool,
    alwaysShowSelect: propTypes.bool,
    disableAutoFocus: propTypes.bool,
    showFeedsOption: propTypes.bool,
    fixedOptions: propTypes.bool,

    defaultFeed: propTypes.oneOfType([propTypes.string, propTypes.arrayOf(propTypes.string)]),
    user: propTypes.shape({ username: propTypes.string }),
    feeds: propTypes.arrayOf(
      propTypes.shape({
        username: propTypes.string,
        type: propTypes.oneOf(['user', 'group']),
      }),
    ),
  };

  constructor(props) {
    super(props);
    this.state = this.stateFromProps(props, this.optionsFromProps(props));
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    const options = this.optionsFromProps(newProps);
    if (
      !isSameFeeds(this.props.defaultFeed, newProps.defaultFeed) ||
      (options.length !== 0 && this.state.options.length === 0)
    ) {
      this.setState(this.stateFromProps(newProps, options));
    } else {
      this.setState({ options });
    }
  }

  get values() {
    return this.state.values.map((item) => item.value);
  }

  stateFromProps(props, options) {
    const defaultFeeds = [];
    if (props.defaultFeed) {
      if (Array.isArray(props.defaultFeed)) {
        defaultFeeds.push(...props.defaultFeed);
      } else {
        defaultFeeds.push(props.defaultFeed);
      }
    }
    const values = options.filter((opt) => defaultFeeds.includes(opt.value));
    if (values.length === 0 && defaultFeeds.length > 0) {
      values.push(...defaultFeeds.map((f) => ({ label: f, value: f })));
    }
    if (props.isDirects && props.isEditing) {
      // freeze default values
      for (const val of values) {
        if (defaultFeeds.includes(val.value)) {
          val.clearableValue = false;
        }
      }
    }
    return {
      values,
      options,
      showFeedsOption: defaultFeeds.length === 0 || props.alwaysShowSelect || props.isEditing,
      isIncorrectDestinations: false,
    };
  }

  get isIncorrectDestinations() {
    return this.state.isIncorrectDestinations;
  }

  optionsFromProps({ feeds, user: { username }, isDirects, excludeMyFeed, isEditing }) {
    const options = feeds.map(({ user: { username, type } }) => ({
      label: username,
      value: username,
      type,
    }));

    options.sort((a, b) =>
      a.type !== b.type ? a.type.localeCompare(b.type) : a.value.localeCompare(b.value),
    );

    if (!excludeMyFeed) {
      // use type "group" for "my feed" option to hide the warning about direct message visibility
      options.unshift({ label: MY_FEED_LABEL, value: username, type: 'group' });
    }

    // only mutual friends on Directs page
    if (isDirects) {
      return options.filter((opt) => opt.type === 'user');
    }
    if (isEditing) {
      return options.filter((opt) => opt.type === 'group');
    }
    return options;
  }

  isGroupsOrDirectsOnly(values) {
    const types = {};
    for (const v of values) {
      types[v.type] = v;
    }
    return Object.keys(types).length <= 1;
  }

  selectChanged = (values) => {
    values = values.map((v) => ({
      type: 'user',
      ...v,
      label: trim(v.label),
      value: trim(v.value),
    }));
    const isIncorrectDestinations = !this.isGroupsOrDirectsOnly(values);
    this.setState({ values, isIncorrectDestinations }, () => {
      this.props.onChange && this.props.onChange(values.map((item) => item.value));
    });
  };

  toggleSendTo = () => {
    const newShowFeedsOption = !this.state.showFeedsOption;
    this.setState({ showFeedsOption: newShowFeedsOption });
  };

  labelRenderer = (opt) => {
    const icon =
      opt.type === 'group' ? (
        <Icon icon={opt.value !== this.props.user.username ? faUsers : faHome} />
      ) : (
        false
      );
    return (
      <span>
        {icon} {opt.label}
      </span>
    );
  };

  promptTextCreator = (label) => `Send direct message to @${label}`;

  // Only valid usernames are allowed
  isValidNewOption = ({ label }) => /^[a-z0-9]{3,25}$/i.test(trim(label));

  reset() {
    this.setState(this.stateFromProps(this.props, this.optionsFromProps(this.props)));
  }

  render() {
    const [defaultOpt] = this.state.values;

    return (
      <div className="send-to">
        {!this.state.showFeedsOption && defaultOpt ? (
          <div>
            To:&nbsp;
            <span className="Select-value-label-standalone">{this.labelRenderer(defaultOpt)}</span>
            <a className="p-sendto-toggler" onClick={this.toggleSendTo}>
              Add/Edit
            </a>
          </div>
        ) : (
          <div>
            <Select
              name="select-feeds"
              placeholder={this.props.isDirects ? 'Select recipients...' : 'Select feeds...'}
              value={this.state.values}
              options={this.state.options}
              onChange={this.selectChanged}
              optionRenderer={this.labelRenderer}
              valueRenderer={this.labelRenderer}
              multi={true}
              clearable={false}
              autoFocus={
                this.state.showFeedsOption && !this.props.disableAutoFocus && !this.props.isDirects
              }
              autoBlur={true}
              openOnFocus={true}
              promptTextCreator={this.promptTextCreator}
              backspaceToRemoveMessage=""
              fixedOptions={
                this.props.fixedOptions || (this.props.isEditing && !this.props.isDirects)
              }
              isValidNewOption={this.isValidNewOption}
            />
            {this.state.isIncorrectDestinations ? (
              <div className="selector-warning">
                Unable to create a direct message: direct messages could be sent to user(s) only.
                Please create a regular post for publish it in your feed or groups.
              </div>
            ) : (
              false
            )}
          </div>
        )}
      </div>
    );
  }
}

function isSameFeeds(feeds1, feeds2) {
  if (Array.isArray(feeds1) && Array.isArray(feeds2)) {
    return feeds1.length === feeds2.length && xor(feeds1, feeds2).length === 0;
  }
  return feeds1 == feeds2;
}

function selectState({ sendTo: { feeds } }, ownProps) {
  if ('feeds' in ownProps) {
    return { fixedOptions: true };
  }
  return { feeds };
}

export default connect(selectState, null, null, { forwardRef: true })(SendTo);
