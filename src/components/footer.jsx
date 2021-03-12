/* global CONFIG */
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

export default function Footer() {
  const authenticated = useSelector((state) => state.authenticated);
  return (
    <footer className="footer">
      <p role="navigation">
        &copy; FreeFeed 1.97.0 (Not released)
        <br />
        <Link to="/about">About</Link>
        {' | '}
        <a
          href="https://github.com/FreeFeed/freefeed-server/wiki/FAQ"
          target="_blank"
          rel="noopener"
        >
          FAQ
        </a>
        {' | '}
        <Link to="/about/terms">Terms</Link>
        {' | '}
        <Link to="/about/privacy">Privacy</Link>
        {' | '}
        <Link to="/about/stats">Stats</Link>
        {' | '}
        <a href="https://status.freefeed.net/" target="_blank" rel="noopener">
          Status
        </a>
        {' | '}
        <a href="https://github.com/FreeFeed" target="_blank" rel="noopener">
          GitHub
        </a>
      </p>
      {!authenticated && (
        <>
          <hr />
          <p>
            <Link to="/">{CONFIG.siteTitle}</Link> is a small nonprofit social network. It does not
            sell your data, nor does it show ads to you. <Link to="/signup">Join us</Link> and meet
            our community.
          </p>
        </>
      )}
    </footer>
  );
}
