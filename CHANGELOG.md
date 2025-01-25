# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.137.0] - Not released
### Fixed
- File uploader now properly displays the upload progress.

## [1.136.3] - 2025-01-05
### Changed
- We now use the our own CORS proxy when showing the link previews for Coub,
  Giphy and Aparat services.

## [1.136.2] - 2024-12-04
### Changed
- The autocomplete is now queries server during typing. It allows to show exact
  matches of private users and groups.

## [1.136.0] - 2024-11-08
### Changed
- The advanced search form is refactored to support the new search operators.
### Added
- When user presses '/' or 'Ctrl+K' hotkeys, the search input form in the
  header is focused.
- This form now has an "Advanced search options" button that redirects to the
  advanced search form.
### Fixed
- The post attachments now appear in the same order as they were added by user.
  Previously, attachments were sorted by the upload order.
- User's avatars in the posts are now shown without a loading="lazy" attribute.
  If the avatar picture is not found, the default avatar is shown.

## [1.135.3] - 2024-10-22
### Fixed
- Multiple fixes in style handling process:
  - Bootstrap 3 is now a regular dependency in package.json;
  - Modern compiler API of Sass is used, see
    [details](https://sass-lang.com/documentation/breaking-changes/legacy-js-api/#bundlers);
  - All mixed declarations in .scss files were removed, see
    [details](https://sass-lang.com/documentation/breaking-changes/mixed-decls/).
- The last UNSAFE_* methods were removed from React components.

## [1.135.1] - 2024-10-08
### Fixed
- iOS has strange behavior with service workers updates, so use the version file
  method instead.

## [1.135.0] - 2024-10-08
### Added
- The PWA manifest and the service worker was added. The service worker caches
  all site assets, including web fonts. It also caches user profile pictures (up
  to 100 entries). The AppUpdated component periodically checks the service
  worker for update.
### Changed
- Enable player for video attachments. Add a playback time limit for it.
### Fixed
- The SmartTextarea component now handles the 'onPaste' event more precisely.
  When the clipboard contains the text and the image in the same time, both are
  pasted.
- The recipients list of a post was determined incorrectly if some of the post
  groups were not on the page.

## [1.134.4] - 2024-08-26
### Changed
- The 'Privacy' and 'Terms' pages now renders statically from the Markdown files
  and available on the `/docs/privacy` and `/docs/terms` paths. It makes them
  accessible for the checking robots, that cannot execute the JavaScript.

## [1.134.3] - 2024-07-29
### Added
- The autocomplete menu now has a links to the found users/groups pages. These
  links opens in a new tab for the most cases. Links opens in the current tab
  when the user enters the "@username" in the search bar at the beginning of the
  query.
### Changed
- The 'Expandable' component was rewritten using the modern browser APIs. It now
  properly handles the content updates and does not require the content to be
  fully inline.

## [1.134.2] - 2024-07-20
### Fixed
- Style issues for code blocks.

## [1.134.1] - 2024-07-15
### Fixed
- Potentially dangerous RegExp in the code blocks logic.

## [1.134.0] - 2024-07-15
### Added
- Add support for inline code (single backticks) and code blocks (triple backticks)
  to post/comment text parser.
### Fixed
- Autocomplete menu did not update properly after the server autocomplete
  response.

## [1.133.0] - 2024-07-04
### Added
- Add a "description" meta-tag to the index.html.
- Autocomplete for the user/group names in the post and comment inputs. When the
  user types "@" and some text afterwards, the matched users/groups are shown
  beneath the text input.
### Changed
- Switch to V3 server API (with _omittedCommentsOffset_ field and two comments
  after the fold).
### Fixed
- Update SSI patterns in index.html to support dashes in groupnames.
- Bug on iOS that blocks deletion of post's attachments.

## [1.132.0] - 2024-05-27
### Added
- Ability to "unlock" and preview comments from the banned users and with reply
  to the banned users.
### Fixed
- Fixed a bug where the first partial opening of comments ("show last N") would
  open one extra comment.

## [1.131.3] - 2024-05-08
### Fixed
- Separate local and remote file list changes in the file uploader (finish the
  fix in 1.131.1).

## [1.131.2] - 2024-05-08
### Fixed
- Programmatic insertion into the comment text area is now debounced with a
  timeout of 100ms. It prevents races when multiple files are uploaded at the
  same time.
- Very long words now breaks up in the comment preview and at the Notifications
  page.

## [1.131.1] - 2024-05-06
### Fixed
- Fixed a draft fileIds synchronization bug.

## [1.131.0] - 2024-05-05
### Added
- Allow to unfold comments step by step on the home and feed pages.
### Fixed
- Fixed a bug that caused not all uploaded files to be attached to a post.

## [1.130.0] - 2024-04-26
### Added
- Support for symmetric bans: comments of users, who have banned the viewer, are
  hidden for the viewer.

## [1.129.3] - 2024-04-12
### Changed
- Use blurred low-res preview of NSFW images instead of solid gray panels.

## [1.129.2] - 2024-04-10
### Fixed
- Fix the comment form's "Cancel" button behavior in the feed.

## [1.129.1] - 2024-04-10
### Fixed
- Don't show the "Clear" button on empty forms.

## [1.129.0] - 2024-04-09
### Added
- Drafts now can be completely disabled by user.
- Post and comment creation forms now have a "Clear" button that resets the form
  state.
### Fixed
- After a successful password reset, the user is now redirected to the sign-in
  page.

## [1.128.2] - 2024-03-29
### Added
- Ability to read other people's minds.

## [1.128.1] - 2024-03-18
### Fixed
- Youtube returns a 401 response for videos that are not allowed to be embedded.
  These videos used to cause an error, now they are displayed as previews.

## [1.128.0] - 2024-03-01
### Fixed
- Fix lightbox for some old attachments that have no sizes in API responses.
### Added
- Drafts. When a user creates/edits a post or comment, the entered text is
  automatically saved to localStorage. This prevents accidental loss of content
  in case of a bad connection or browser closure. For posts, saved drafts also
  contain attachments and feed name information.

  Draft data automatically synchronized between the browser tabs, but not
  between the other user's devices.

  Drafts are deleted when a post/comment form has been successfully submitted or
  explicitly canceled by the user. When the user signs out, all draft data is
  deleted. Draft data also deletes when the signed in user changes.

  User can disable drafts saving on the Settings / Privacy page. In this case,
  drafts will still work, but will not be saved to persistent storage and will
  be lost on tab close/reload.
### Changed
- RTL texts are now right-aligned in the post bodies and in the user
  descriptions.

## [1.127.3] - 2024-02-14
### Fixed
- Incorrect use of 'useEffect' causing a crash on the 'Manage Group Subscribers'
  page.

## [1.127.2] - 2024-02-04
### Fixed
- Return the 'maximum-scale=1' back to the "viewport" meta tag, but remove it on
  non-iOS platforms. This allows to zoom in page on all platforms, but prevents
  the unwanted auto-zoom on iOS.

## [1.127.1] - 2024-02-02
### Changed
- Upgrade React to v18
- Users can now scale the site with a pinch gesture on mobile devices.
- The lightbox code now detects image sizes faster when showing images from text
  links. User doesn't see a small 100x100 preview anymore.

## [1.127.0] - 2024-01-19
### Changed
- Use the latest (v5) version of PhotoSwipe library.

## [1.126.0] - 2023-12-21
### Added
- User can now turn on/off notifications for new comments on the posts they
  commented on.

## [1.125.1] - 2023-11-24
### Fixed
- Missing post submission form on group pages.

## [1.125.0] - 2023-11-24
### Added
- The site administrator can now define a list of "privacy control groups" in
  the config (the _privacyControlGroups_ entry). These groups will be always
  shown in the feed selector of new or existing posts. The pages of such groups
  do not show posts by default, and such groups cannot be subscribed to.
- Support for the new "Notify of new comments" feature:
  - User can now turn on/off notification for new comments on the specific post
    via the "More" menu item;
  - User can now turn on/off notification for new comments on their own posts;
  - The new "Comments" tab has been added to the "Notifications" page.
### Changed
- The wording "Disable blocked contingent..." (in the context of groups) has
  been replaced by "Show blocked content..." as more clear.

## [1.124.2] - 2023-10-25
### Fixed
- Checkboxes in texts was broken during the 'social-text-tokenizer' upgrade.

## [1.124.1] - 2023-10-11
### Fixed
- Some SASS issues.

## [1.124.0] - 2023-10-11
### Changed
- The feed selector ('To:' line) is now always visible in the post creation
  form.
- The "Edit list" link is no longer shown next to the Home or friend list page
  title. It has been moved to the "•••" menu on the right side of the list
  header.
- Upgrade 'social-text-tokenizer' (the post/comment texts parser) to the version
  3.0.

### Fixed
- Reddit r/-links were displayed incorrectly.
- During direct message editing, there is no access check of the existing
  recipients (even if some of them are gone). This check is unnecessary because
  the message author cannot remove the existing recipients anyway.

## [1.123.3] - 2023-09-15
### Fixed
- The algorithm for displaying the "Expand" button in "compact" text mode has
  been fixed.

## [1.123.2] - 2023-09-10
### Fixed
- Post actions didn't work on the post backlinks page.

## [1.123.1] - 2023-09-07
### Fixed
- The non-existent post page did not display the correct error message.

## [1.123.0] - 2023-09-05
### Added
- Links to posts and comments are now shorter: e.g. `/user/4a39b8` (a post) or
  `/groupname/f482e5#ad2b` (a comment).
  - All public URLs and links to posts and comments are now in short format.
  - Addresses of posts and comments with leading slash (`/user/...`) are now
    parses in texts as active links.
  - Old-fashion links, with long UIDs, are still fully supported.
- New page(s) `/:userName/:postId/backlinks` that displays posts that link to
  this post. This replaces the old way of displaying backlinks, which used
  search.

### Changed
- Spoiler tag can now contain line feeds. In addition, user text formatting
  utilizes simpler HTML, with fewer wrappers. Visually, the output for the user
  is not changed (except for line translations in spoilers).
- Text checkboxes are not processed in a special way if there is more than one
  of them in the text.

### Fixed
- The default font set no longer includes the Helvetica family when the client
  platform is Windows. Helvetica is not a native font in Windows, and the
  manually installed version of the font may be incomplete (for example, not
  contain Cyrillic).
- Updated TWEET_RE regex to support matching x.com in addition to twitter.com.

## [1.122.1] - 2023-08-10
### Changed
- Disable player for video attachments until we can deal with the increased
  traffic from them.

## [1.122.0] - 2023-07-31
### Added
- Comments can now be used as checklists if the comment text starts with "[ ]"
  or "[x]" (one can use other symbols in parentheses as well: [v], [*], [🗸], or
  Russian "Ha").
  
  If the current user matches the author of the comment, an interactive checkbox
  is displayed at the beginning of the text. When the user clicks the checkbox,
  the comment text changes to reflect the checkbox state.

  For other users, a fixed-width text representation of the checkbox is shown:
  "[ ]" or "[🗸]".
### Fixed
- Telegram previews now supports dark theme

## [1.121.1] - 2023-07-15
### Fixed
- Expand texts of translated posts/comments

## [1.121] - 2023-07-15
### Added
- Ability to translate the text of comments and posts (if supported by the
  server). Users can set their language for translation in the preferences (the
  browser language is used by default). There is a new "Translate to..." item in
  the "More" menu for comments/posts.
### Fixed
- User can now search for "My feed" in feeds selector
- Increased margin under the "Expand preview" button

## [1.120.2] - 2023-06-22
### Fixed
- Bookmarklet did not open
  - Bookmarklet component is now wrapped in Suspense because it is loaded
    dynamically
- UserSubscriptionEditPopup did not open when one clicked the 'edit' button
  - Fixed import of UserSubscriptionEditPopup component
  - The component returned by the 'lazyComponent' helper now receives a
    reference

## [1.120.1] - 2023-06-15
### Changed
- Deprecated 'vazir-font' package replaced with 'vazirmatn'
### Fixed
- Startup styles are applied only to the initial state of the page and do not
  interfere with application styles.

## [1.120] - 2023-06-14
### Changed
- The start script that initiates the configuration and sets the color scheme is
  now injected into the HTML code. The custom configuration is also injected
  using SSI, if possible. This allows instant access to the configuration,
  without an additional HTTP request, and allows the correct color scheme to be
  applied before the document body starts rendering. This, in turn, gets rid of
  the blinking when the page loads.
### Fixed
- Initial layout styles, to prevent jerking while loading
- Added support for legacy browsers, that doesn't support modern ES features

## [1.119] - 2023-06-02
### Added
- Show the next comment in the same comment preview panel when clicking on the
  "^^" in the comment preview.
### Changed
- Use Vite as builder and Vitest as test runner. We no longer need Webpack,
  Mocha, Jest, and (mostly) Babel! Also:
  - 'lodash' replaced with 'lodash-es' for better tree shaking
  - Rare used pages, components and libraries now loaded asynchronously
- Multiple cosmetic corrections preparing the transition to Vite as a builder:
  - Use Dart Sass instead of node-sass
  - Use math.div instead of "/" in SCSS files
  - Rename files uses JSX syntax from .js to .jsx
  - Remove non-standard do {} syntax
  - Use explicit import() statements in the index.jsx
  - Use relative css imports for styles from node_modules
  - Update stylelint calls and fix styles issues
- The users and groups pages now shows dynamically calculated statistics.
- All "a" links without the "href" attribute and some other pseudo-buttons have
  been replaced by the ButtonLink component. This improves the keyboard
  accessibility of the site because ButtonLink is able to focus and click from
  the keyboard.
### Fixed
- The backlink click now doesn't reload a full page.
- On iOS, the feed selector doesn't focus properly after clicking the Add/Edit
  button.

## [1.118] - 2023-05-05
### Added
- Support for Aparat.com video hosting
- Support for songs on music.youtube.com
- Support for YouTube playlists
- Calender view

### Changed
- Updated feed selector component:
  - The react-select library has been updated from v1 to v5
  - It is possible to create posts in non-private groups without being a member
    of them. A post creation form is available on the pages of such groups.
  - All post creation and editing form controls are now accessible from the
    keyboard.
  - The feed selector can search by username and screenname. Search with an
    incorrect keyboard layout is possible (English, Russian and Ukrainian
    layouts are supported).
  - Privacy indication is improved:
    - The "Post" button shows the privacy icon of the post being created.
    - The feed selector shows group privacy icons.
    - A warning is shown if the post is published in groups with different
      privacy levels.

### Fixed
- Minor attachment-related issues:
  - More reliably detect screenshot paste,
  - Proper pass the file name to attachment creation method.
- An error inserting pictures when editing a post
- Titles of YouTube videos are properly displayed now

## [1.117.1] - 2023-04-01
### Fixed
- Hiding attachments under the 'read more' fold

## [1.117] - 2023-03-31
### Added
- A new "Mention @username" item has been added to the post's dropdown menu.
  By clicking on it, you can start a new comment and mention the person who
  created the post, or add their @username to the comment you have already started creating.
- Vimeo on demand links support
### Changed
- Take Save out of "more" menu
- The Dropzone library has been replaced with a custom file uploader.
  Attachments for posts and comments are now uploaded uniformly. The CreatePost
  and PostEditForm components have been redesigned to utilize the new uploader.
- The internal SubmittableTextarea component replaced by new SmartTextarea. The
  SmartTextarea allows to:
  - submit text by Enter of Ctrl/Cmd+Enter;
  - handle files paste and drag-n-drop;
  - insert text to the cursor position using 'insertText' instance method;
  - use 'onText' attribute to handle updated text (it is necessary for
    'insertText' updates, which doesn't trigger onChange).

  This component handles all tasks related to creating/editing posts and
  comments in a unified way.

## [1.116.1] - 2023-03-11
### Fixed
- Minor bugs

## [1.116] - 2023-03-10
### Added
- Rich event preview on Notifications page. Every event now has a user picture
  and text of comment or post (if this event is comment- or post-related).
- Reddit's `r/subreddit` and `/r/subreddit` addresses are now auto-linked.
### Changed
- "Delete" item of the "More" menu is visible to the user for every comment in user’s own post
- "Delete" item of the "More" menu is visible to a group admin for every comment

## [1.115.2] - 2023-02-21
### Fixed
- Incorrect "Block user" popup display on user card.
- "Add comment" link doesn't properly focus input on iOS.

## [1.115.1] - 2023-02-14
### Fixed
- The "Add comment" input on iOS in the feed view is now correctly focused
  after creation.
- Broken lightbox view from the comment preview modal window.
### Changed
- The "Comment" link now always opened and focus the "Add comment" input.
  Previously, a second click closed the input field.

## [1.115] - 2023-02-10
### Added
- Confirmation with short info on click on every "Block user" button.
- Disabling bans in groups:
  - Checkbox in group settings (for administrators) to disable/enable bans in
    groups;
  - Add "Disable/Enable blocking in group" buttons on group page;
  - Group group-related actions in drop-down menu in group profile;
  - New events on Notifications page.
### Fixed
- Reload user/group feed after ban/unban and enable/disable bans in group.
- Show creation time and inviting user in gone user profile.
- Click on main comment link on a single post page now moves focus to the comment form

## [1.114] - 2023-01-19
### Added
- Invite-only registration support. Updated invite creation, invite use and sign
  up forms. There is new section in config, _registrationsByInvite_, with the
  _formIframeSrc_ field. It allows to define URL of some external form for
  manual registration requests.

### Changed
- TikTok previews now display as static images and load a full-featured embed
  only after a click.

## [1.113] - 2022-12-25
### Added
- Email verification support. If verification is supported by server, the new
  field (Verification code) is appear in Sign Up and Profile forms. When user
  sets up or updates email address, they should receive verification code on it
  and enter that code to the form.
- NodeJS 18.x is supported now

### Changed
- "Everything", "Search" and "Best of" pages are not available for
  non-authorized users.
- Updated texts about donations to FreeFeed MTÜ

## [1.112] - 2022-11-25
### Added
- Group administrators can now block users in their managed groups. A blocked
  user cannot post to the group, but can read and comment if the group is not
  private.
- Video attachments now have a player, when browser supports them
- YouTube shorts now supported in media viewer

### Fixed
- No refresh needed to view private users and groups after subscription approved
- No refresh needed to interact with new subscription requests
- Hidden comment class name updated to avoid interference with Firefox builtin extension style

## [1.111.2] - 2022-09-23
### Fixed
- Fix broken PhotoSwipe icons

## [1.111.1] - 2022-09-08
### Fixed
- Restore Vazir font (new css-loader didn't load it in 1.111.0)

## [1.111.0] - 2022-09-07
### Added
- Instagram Reels are supported by native previews.
  First contribution by [Mohammad Jafari](https://github.com/MMDJafari/). Thanks!
- It is now possible to hide posts by hashtags! Also, the underlying algorithm
  allows to add other types of hiding criteria in the future.

### Changed
- Take Save out of "more" menu

## [1.110.0] - 2022-06-29
### Fixed
- The erroneous "Remove from" items has been removed from the post's "More" menu
- Fixed domain-name in donate link

## [1.109.0] - 2022-05-12
### Fixed
- On the "Manage Subscribers" group's page, the list of administrators changed
  as the cursor moved over the group members.
- Do not show "Promote" button for deleted users.
- Restore style of the homefeed-dropdown.

### Changed
- The `/CURRENT_USERNAME/subscribers` and `/CURRENT_USERNAME/subscriptions`
  addresses now redirects to the corresponding tabs of the `/friends` page.
- The 'Subscribe' and 'Request a subscription' links no longer open the home
  feed selection window. The subscription is always made to the main Home feed,
  and then the user can change the feed.

## [1.108.2] - 2022-04-20
### Fixed
- Restored "url" and "querystring" polyfills required by webpack.

## [1.108.1] - 2022-04-20
### Fixed
- Restore use of IEC-units for file-sizes.

## [1.108.0] - 2022-04-20
### Added
- Links to the user/group memories in the sidebar of the user/group-related
  pages
- Click on the ^^^-reference shows a preview of the referenced comment

### Fixed
- Remove usage of "screen name" in favor of "display name" in UI

### Changed
- Improve texts for account privacy settings

## [1.107.1] - 2022-03-24
### Changed
- Show registration date in Profiles and Groups

## [1.107.0] - 2022-03-24
### Fixed
- Update "privacy" cookie if it is already set. It should prevent 2-weeks cookie
  expiration in Safari.
- Add extra space between username and "is not in any of your friend lists"
  message.

### Added
- New "Sanitize media files" page (/settings/sanitize-media) which allows to
  remove sensitive metadata from the existing media files.
- New frontend setting: comments.hideRepliesToBanned (false by default, can be
  adjusted on Settings / Appearance page). If it is set to true, comments that
  starts with a @-mention of banned user are replaced by placeholder ('Comment
  with reply to blocked user'). Comments authored by the current user are always
  visible.

### Removed
- Do not try to preview shorten TikTok URLs in posts.

## [1.106.1] - 2022-02-03
### Fixed
- Re-release. 1.106.0 has incorrect merge.

## [1.106.0] - 2022-02-03
### Added
- New flag on the "Privacy" Settings page: "Remove geolocation and other
  sensitive metadata from photos and videos you post".
- Show "you are subscribed" checkmark in "all groups" list
- Display subscription requests alert box on user's profile feed
- "You are subscribed" checkmark in the "All groups" page

### Changed
- Increase p-break height in posts
- Remove extra whitespace around post actions list

### Fixed
- Keep "back=" in URL when linking from "Sign in" to "Sign up"

## [1.105.1] - 2022-01-05
### Added
- Display an indicator between comments that are more than 6 days apart

## [1.105.0] - 2022-01-05
### Added
- Backlinks indication under the post (in form of "N references to this post" link)
- Allow users to leave the direct message (except the author of the message)
- GitHub workflow for creating PR preview on surge.sh
- Internal bugs related to the showing of direct post destination feeds during
  and after editing

### Changed
- The link preview components was refactored to use the modern web APIs and the
  modern React practices.

## [1.103.1] - 2021-11-12
### Fixed
- Accept Apple-music urls without ?l= parameter

## [1.103.0] - 2021-11-12
### Added
- New syntax for the distant comment ^-references. The near references uses a
  familiar syntax ^, ^^…, but starting from five caps these references now
  inserted as ^5, ^6 and so on.
- New appearance flag allows to use post/users hides not only in main Home feed,
  but also in Discussions, Everything, Best of… and user's friend lists pages.
  This flag is off by default.
- Support for cross-platform usernames, i.e. user@mokum, user@lj and so on. The
  services shortcodes and formats should be defined in the config.json (see
  textFormatter.foreignMentionServices in config/default.js).
- Native previews for Apple Music

### Changed
- The comment ^-references are now based of comments sequentional numbers. It
  makes them stable and independent of user's appearance settings. Event if user
  chooses to hide comments from blocked users, the ^-references will point to
  the right places.

### Fixed
- In the dark theme, the Embedly iframes had a white background. For some
  unclear reason we should 'color-scheme' CSS property for the iframe to make it
  background transparent again.
- Blur (un-focus) the ButtonLink conponent after the mouse click. This prevents
  an unwanted onClick from being triggered if the user presses the spacebar (to
  scroll) after a mouse click.

## [1.102.4] - 2021-10-22
### Fixed
- Fix inverted autoplay setting for Vimeo (introduced in 1.102.3)

## [1.102.3] - 2021-10-22
### Fixed
- Generate proper embed-player for private Vimeo videos
- Detect legacy "http" Vimeo urls

## [1.102.2] - 2021-10-17
### Fixed
- Re-release. 1.102.1 did not include proper version information.

## [1.102.1] - 2021-10-17
### Fixed
- Merge bug that prevents the "Text scale" controll on Appearence page from
  working.
- 'webpack-cli' was updated to fix the dev server.

## [1.102.0] - 2021-10-10
### Added
- The 'color-scheme' CSS property now applies on dark/light site mode. This
  property allows to set color scheme for browser UI elements such as scrollbars
  and form inputs.
- "Grips" in sidebar for drag and sort home feeds. Previously, the drag zone
  matched the feed link itself, and that was inconvenient, especially on mobile
  screens.
- "More" menu to posts
- There are two text submit modes now: the Mobile and the Desktop mode. The site
  will try to automatically determine whether it runs on desktop or mobile
  browser. User can manually select the submit mode, this setting will be saved
  in browser storage.
  - In Mobile mode, the Ctrl+Enter and Cmd+Enter acts as submit and Enter press
    caused line break.
  - In Desktop mode, the Enter press acts as submit, to insert a new line user
    should press Shift+Enter or Alt+Enter.
- Some frontend preferences defaults can now be overridden depending on the
  account's createdAt date. It is useful for the new defaults that breaks the
  old behaviour and shouldn't affect the existing users.

### Removed
- The Space+Enter functionality is removed. It is no longer necessary since we
  have Mobile submit mode now.

## [1.101.2] - 2021-10-07
### Fixed
- Re-release. 1.101.1 did not include proper version information.

## [1.101.1] - 2021-10-07
### Fixed
- In the old days, users could create groups with groupnames up to 27 characters
  long. Now the client router supports these names.

## [1.101.0] - 2021-09-19
### Added
- User can adjust the site font size in settings' Appearance tab. This setting
  is saved locally in web browser and can be different for each browser and each
  device. The available font size range is 80% - 150% relative to the default
  size.
- Notification messages for the 'backlink_in_post' and 'backlink_in_comment'
  events.

### Changed
- Post can now have an empty body if it contains one or more attachments.
- The sidebar memories years now starts from 2005.

### Fixed
- Fix the mobile Chrome unwanted font boosting
- Fix invalis data of the some archive posts

## [1.100.0] - 2021-07-30
### Added
- Warning about the orphan groups on the "Delete account" page.
- Lightbox-navigation between attachments of single comment

### Changed
- The Highcharts library replaced by the Recharts due to license incompatibility.

### Fixed
- Group admins now can remove a post from one group at a time
  ([#1398](https://github.com/FreeFeed/freefeed-react-client/issues/1398))

## [1.99.1] - 2021-07-03
### Fixed
- Show missing throbber in "more comments" loader

### Added
- Added explicit error-handlers to naked promises

## [1.99.0] - 2021-06-08
### Added
- Display usernames of gone users in post comments in grey color
- Headers of sidebar blocks are links now
- "More" menu for comments with all comment-related actions and information

### Fixed
- Changes in search field on the "All Groups" page now resets the page number to
  the first page. Also the page and the query string are now synchronized with
  the URL's query parameters.
- A group table on 'All Groups" page is scrollable on narrow screens now
- Fix accessibility-labels of comment-likes (actions were opposite to the real ones)

### Changed
- Removed thin red line in upload preview
- Point beta-reports to "beta" group instead of "support"

## [1.98.2] - 2021-04-09
### Fixed
- Accept the 'q' GET-parameter as search query in the header form

## [1.98.1] - 2021-04-09
### Fixed
- Typo on Donate page

## [1.98.0] - 2021-04-08
### Added
- Generate '_dist/version.txt' file during production build. This file contains
  build version and date and can be used to auto-check the client updates.
- The client now can detect the updates of its code on the server and advice the
  user to reload the page. This feature is turned off by default. When enabled,
  the client makes a HEAD request every 5 minutes (configurable) to the specific
  address ("/version.txt" is recommended) and looks for the specific response header
  ("Last-Modified" by default). When the header value is changed, the information bar is
  shown to the user: “There’s a new update for FreeFeed available!
  _Refresh_the_page_ when you are ready.”
- Confirmation dialog when the private user wants to unsubscribe someone from
  himself.
- Donation 'traffic light' in the sidebar. This widget depends of
  `donations.statusAccount` config field (null by default means no widget). This
  field should contain the _username_ of the group (or user) whose _screenname_
  sets the donate status. The available statuses are 'Very good', 'Good', 'OK',
  'Very low', 'Low', 'Critical'. The widget performs case-independent search for
  these substrings in the screenname.
- Donation parameters (PayPal button ids, LiberaPay and YooMoney widgets) are
  now configurable by config.
- New mobile-friendly Sidebar and search-input

### Fixed
- When the user visits the post by non-canonical URL, the client replaces URL to
  canonical one, keeping the query string and hash if present. Previously the
  query string and hash were not preserved.
- The scroll compensation isn't applied now when the window scrollY position is 0.
  So when some content appears on the top of the page, it will not caused scroll
  compensation and will not be hidden under the top window edge.
- The info popups now shows properly for users that changed their usernames.
- The 'beta' cookie is now re-installed every time the application started. This
  is to trick Safari that deletes cookies after 7 days.

### Changed
- Removed old invalid links to Clio and "Archives F.A.Q."
- Post created by the user with 'Create post' from is showing with expanded
  comments. The user can add multiple comments to the newly created post and
  they will not be suddenly collapsed.

## [1.97.0] - 2021-03-18
### Fixed
- If the anonymous user visits the page that require authorization, the browser
  redirects to the `/signin?back=…` page. Previously, the back parameter
  included only the pathname of the page, not the query and hash. It is fixed,
  and now it includes pathname + query + hash. It is especially important for
  the magic links to the token creation page.
- The COMPLETE_POST_COMMENTS responses was not fully processed, leading to
  `Cannot read property 'username' of null` errors when updating comments.
- Tapping a user link was sometimes recognized as a mouse click on iOS devices.
- Make reducers compatible with offline state (they didn't know how to handle connectivity errors previously)

### Added
- The 'Sign In' link in the header now has '?back=...' parameter that will
  redirect user back to the viewed page after sign in.
- Forced page reloading after sign out. This guarantees a complete
  reinitialization of the state, which, unfortunately, is difficult to achieve
  by other methods.
- Handle incorrect memory-urls as explicit "error 404"

## [1.96.1] - 2021-03-11
### Fixed
- Properly update state of groups in realtime

## [1.96.0] - 2021-03-11
### Added
- Error timestamp in error boundary message

### Fixed
- The COMPLETE_POST_COMMENTS responses was not fully processed, leading to
  `Cannot read property 'username' of null` errors when updating comments.
- Deleting the friend list may have caused an error in the sidebar.

### Changed
- Underline sidebar links on hover
- User links in the sidebar (link to the current user and to the recent groups)
  doesn't show informational popup anymore.

## [1.95.4] - 2021-03-07
### Fixed
- The numbers of likes of omitted comments now updates in the real time.
- The posts and comments data now fully rewrites on feed update. It has been
  broken in recent releases and click on FreeFeed logo wasn't collapse expanded
  comments and likes

### Changed
- Moved comments highlight logic from redux to PostComments' state

## [1.95.3] - 2021-03-05
### Fixed
- Update comments data on realtime event

## [1.95.2] - 2021-03-04
### Fixed
- Restore highlighting of comments on author name hover (regression in 1.95.0)

## [1.95.1] - 2021-03-04
### Fixed
- Set beta channel flag after the preferences update response

## [1.95.0] - 2021-03-03
### Fixed
- Group screennames in the right menu and in the page titles now updates in the
  real time

### Added
- Links between All Groups and Your Groups pages
- Jest-based snapshot tests

### Removed
- Remove previews for the Reddit links. Reddit embeds can contain a video with
  sound that plays automatically in the feed.

### Changed
- The logic for expanding/collapsing comments has been rewritten. Now up to two
  comments can be seen after the fold. If after deleting a comment there are no
  comments left before or after the fold, new data is fetched from the server.
  If any of the comments are being edited, they won't fold until the editing is
  finished.

## [1.94.0] - 2021-02-18
### Fixed
- Tiktok previews work for videos with empty title

### Changed
- Optimized build results: split code in smaller js-bundles, pre-compress js/css files
- On touch devices, where hover is not available, the user info popup now
  appears after clicking the user link. To navigate to the user's page, you need
  to click on the link inside the popup.
- Raised maximum length of posts and comments to 3000 chars
- Raised minimum password length to 9 chars

## [1.93.1] - 2021-01-29
### Fixed
- Move "fold comments" label above the readmore

### Changed
- Tweaked russian-language text for welcome screen

### Removed
- Removed Auth token reissue and inter-tab synchronization logic

## [1.93.0] - 2021-01-27
### Added
- Added some ARIA-roles markup

### Changed
- Changed the authorization tokens reissue algorithm. Now any tab can reissue
  tokens. Tabs uses locking for conflict protection and listens for the token
  changes from the other tabs.

## [1.92.1] - 2021-01-24
### Fixed
- Avoid breaking lines in stats of private users
- Fix errors when signing out from some of sub-pages of settings

## [1.92.0] - 2021-01-24
### Fixed
- A tall Embedly previews now folded to a reasonable height
- Created subscription requests are now visible at 'Requests' page without full
  page reload.
- Fix profile head layout in narrow screens
- Prevent statlinks from wrapping on narrow screens
- Avoid showing "edit list" control for anonymous users
- Remove ellipsis on narrow screens on group header

### Changed
- Improved english text on welcome screen

## [1.91.0] - 2021-01-15
### Fixed
- Text is properly selectable (select, copy, paste) even if it has spoiler-tags in it
- Selecting text does not reveal spoiler contents on Windows
- Improve auto-direction support in text inputs (useful for right-to-left languages)
- Load external css-files after inline styles. Otherwise, rules priority was broken
- Prevent display of link previews from inside spoilers
- Focus is removed from post textarea after posting
- Fix highlight color of expand-panel
- Fix YouTube previews
### Added
- Use open-source Vazir font to display Persian letters
- New authorization sessions support. User is now able to view and manage
  (close) their authorization sessions on the special settings page.
- User's stats block (on her feed-page) has "All posts" link now
- "All Groups" page can be filtered now
- "Spoiler" texts can be hidden by clicking on them
- The "Beta version" functionality. The instance can be declared as beta
  version. In this case the "Beta" subheader and the floating "Report a bug"
  button is shown.

## [1.90.1] - 2020-12-30
### Fixed
- Restored accidentally deleted "Browse" word from sidebar

## [1.90.0] - 2020-12-29
### Fixed
- Compensate the unwanted scrolling on iOS Chrome after lightbox closing.
- Prevent early close of the comment-likes list (It started to close after opening in React 17)

### Added
- Developers can use the _config.json_ file in the project root during the dev.
  server run. This file will not be included in compiled code but it is useful
  for development because config changes now doesn't require full client
  rebuild.

### Changed
- Developer server (started by `yarn start`) now listening all network
  interfaces instead of just 127.0.0.1. It helps to debug client on different
  devices in same network.
- Tweaked contrast of spoiler-tags (they're WCAG compatible now)
- Don't close clikes-panel on click inside of it (still close it on click outside)
- Wait up to 250ms after click to show fully rendered clikes panel. Show throbber if data is not ready after that

## [1.89.3] - 2020-12-18
### Fixed
- Resolved regression (removed prematurely enabled react-17)

## [1.89.2] - 2020-12-18
### Fixed
- Prevent conflict between spoilers and 'read more'

### Added
- Link to results in Vote2020 block

## [1.89.1] - 2020-12-15
### Changed
- Use different style for "vote2020" block (thanks to @clbn)

## [1.89.0] - 2020-12-13
### Added
- A 'Not Found' page for URI's that does not match any of the site routes.
- A &lt;spoiler> tag for the sensitive or spoiler texts.
- Support for FreeFeed's Supervisory Board 2020 election

### Changed
- Applied some rendering optimisations

## [1.88.1] - 2020-11-17
### Fixed
- Show explicit error if config.json failed to load, and it wasn't 404

## [1.88.0] - 2020-11-10
### Fixed
- Embedly previews handle light/dark theme switching properly
- Home feed edition popups now closes when the Esc key is pressed or the shadow
  overlay is clicked
- Incorrect sorting of recent groups when getting real-time updates

### Changed
- Google Analytics ID isn't hardcoded in index.jade anymore.

- Client now supports arbitrary list of external identity providers that are
  available on the server.

## [1.87.1] - 2020-10-14

### Fixed

- Update version in footer

## [1.87.0] - 2020-10-13

### Added

- SoundCloud links previews
- Support of [well-known URL for changing passwords](https://w3c.github.io/webappsec-change-password-url/)
- Spotify links previews

### Fixed

- Links to the images hosted on Dropbox are now correctly displayed in a lightbox
- Improve mentions parsing

### Changed

- Cut the post links in texts after the first UUID octet block

## [1.86.0] - 2020-09-15

### Changed

- Describe new search-syntax rules
- Add support for URLs ending with asterisk

## [1.85.1] - 2020-09-11

### Fixed

- The sidebar block headers can be multiline now. It is useful for long variable phrases like “Memories of September 30”. Also, we prevent linebreaks between month and day in the Memories header.
