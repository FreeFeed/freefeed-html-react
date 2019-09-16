import React from 'react';
import { Link } from 'react-router';

export default () => (
  <footer className="footer">
    &copy; FreeFeed 1.68.3 (Sep, 16, 2019)
    <br />
    <Link to="/about">About</Link>
    {' | '}
    <Link to="/about/terms">Terms</Link>
    {' | '}
    <Link to="/about/privacy">Privacy</Link>
    {' | '}
    <Link to="/about/stats">Stats</Link>
    {' | '}
    <a href="https://status.freefeed.net/" target="_blank">
      Status
    </a>
    {' | '}
    <a href="https://github.com/FreeFeed" target="_blank">
      GitHub
    </a>
  </footer>
);
