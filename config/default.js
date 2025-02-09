import { DISPLAYNAMES_BOTH } from '../src/utils/frontend-preferences-options';
import { ACTIVITY, HOMEFEED_MODE_CLASSIC } from '../src/utils/feed-options';
import { TLDs } from './lib/tlds';

const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

export default {
  api: {
    root: 'https://candy.freefeed.net',
  },

  siteTitle: 'FreeFeed',

  siteOrigin: 'http://localhost:3333',

  auth: {
    tokenPrefix: 'freefeed_',
    userStorageKey: 'USER_KEY',
  },

  captcha: {
    siteKey: '',
  },

  search: {
    searchEngine: null,
  },

  siteDomains: [
    // for transform links in the posts, comments, etc.
    'freefeed.net',
    'gamma.freefeed.net',
  ],

  // For links in texts
  attachmentDomains: ['stable-media.freefeed.net'],

  textFormatter: {
    tldList: TLDs,
    /**
     * The format is:
     * [
     *  { title: "Telegram", linkTpl: "https://t.me/{}", shortCodes: ["tg", "telegram"] },
     *  { title: "Twitter", linkTpl: "https://twitter.com/{}", shortCodes: ["tw", "twitter"] },
     *  ...
     * ]
     */
    foreignMentionServices: [],
  },

  sentry: {
    publicDSN: null,
  },

  frontendPreferences: {
    clientId: 'net.freefeed',
    // Use only plain JSON types here. Do not use null values (for type checking).
    defaultValues: {
      displayNames: {
        displayOption: DISPLAYNAMES_BOTH,
        useYou: true,
      },
      realtimeActive: false,
      comments: {
        omitRepeatedBubbles: true,
        highlightComments: true,
        showTimestamps: false,
        hideRepliesToBanned: false,
      },
      allowLinksPreview: false,
      readMoreStyle: 'modern',
      homeFeedSort: ACTIVITY,
      homeFeedMode: HOMEFEED_MODE_CLASSIC,
      homefeed: { hideUsers: [], hideTags: [] },
      hidesInNonHomeFeeds: false,
      pinnedGroups: [],
      hideUnreadNotifications: false,
      timeDisplay: {
        absolute: false,
        amPm: false,
      },
      timeDifferenceForSpacer: DAY_IN_MILLISECONDS * 6,
      translateToLang: '', // Empty string means browser default language
      saveDrafts: true,
    },
    defaultOverrides: {
      /**
       *  Here you can override the default values depending on the 'createdAt'
       *  time of user. The object key is a Lodash 'path' in the defaultValues
       *  object.
       *
       * The 'createdBefore' and 'createdSince' are the only supported opeators
       * for now.
       *
       * The example below means that for all accounts created since
       *  2021-08-01, the 'submitByEnter' has a 'false' default value.
       */
      // submitByEnter: { createdSince: '2021-08-01', value: false },
    },
  },

  appearance: {
    colorSchemeStorageKey: 'color-scheme',
    nsfwVisibilityStorageKey: 'show-nsfw',
    uiScaleStorageKey: 'ui-scale',
    submitModeStorageKey: 'submit-mode',
    orbitStorageKey: 'orbit-disabled',
  },

  orbitDate: '2024-04-01',

  commentsFolding: {
    // Show a maximum of two comments after the fold
    afterFold: 2,
    // Show 'collapse' button when there are 12 or more comments
    minToCollapse: 12,
    // A minimum number of omitted comments (server-side constant)
    minFolded: 3,
    // A minimum number of omitted comments when the stepped folding is appear
    minToSteppedFold: 15,
    // A value of the stepped folding
    foldStep: 5,
  },

  // if false, new users are public by default
  newUsersProtected: false,

  registrationsLimit: {
    emailFormIframeSrc: null,
  },

  registrationsByInvite: {
    formIframeSrc: null,
  },

  analytics: {
    google: null,
  },

  betaChannel: {
    // Set to true to enable 'Use the beta version' switcher in settings
    enabled: false,
    // Is the current instance is a beta instance?
    isBeta: false,
    subHeading: 'Beta',
    cookieName: 'beta_channel',
    cookieValue: '1',
  },

  maxLength: {
    post: 3000,
    comment: 3000,
    description: 1500,
  },

  minPasswordLength: 9,

  appVersionCheck: {
    // Use real URL/URI here to enable update check
    url: '',
    // It depends on your server configuration, which header is better to use
    // for update checking. It may be 'Date', 'ETag', or some other header.
    header: 'Last-Modified',
    intervalSec: 300,
  },

  donations: {
    // Username of the account which screenname reflects the current donation
    // status. The available statuses are 'Very good', 'Good', 'OK', 'Very low',
    // 'Low', 'Critical'. The donation widget performs case-independent search
    // for these substrings in the screenname.
    statusAccount: null,
    // User name of the account in which reports are published
    reportsAccount: null,
    paymentMethods: {
      // PayPal hosted_button_id parameter
      payPalRegularButtonId: null,
      // PayPal hosted_button_id parameter
      payPalOneTimeButtonId: null,
      // LiberaPay project name
      liberaPayProject: null,
      // yasobe.ru project name
      yasobeRuProject: null,
      // boosty project name
      boostyProject: null,
    },
  },

  privacyControlGroups: {
    hidePosts: true, // Hide posts on these groups pages
    disableSubscriptions: true, // Disable subscriptions on these groups
    groups: {
      // Define groups like this:
      // 'public-groupname': { label: 'Makes post public', privacy: 'public' }
    },
  },

  drafts: {
    storagePrefix: 'draft:',
    maxDraftAge: 7 * DAY_IN_MILLISECONDS,
  },
};
