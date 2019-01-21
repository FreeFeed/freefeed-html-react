import React from 'react';
import { Link } from 'react-router';


export default () => (
  <footer className="footer">
    &copy; FreeFeed 1.57.3 (January 21, 2019)<br />
    <Link to="/about">About</Link> | <Link to="/freefeed">News</Link> | <a href="https://dev.freefeed.net/w/faq" target="_blank">FAQ</a> | <Link to="/about/terms">Terms</Link> | <Link to="/about/privacy">Privacy</Link> | <a href="https://status.freefeed.net/" target="_blank">Status</a> | <Link to="/about/stats">Stats</Link> | <Link to="/invite">Invite</Link>
  </footer>
);
