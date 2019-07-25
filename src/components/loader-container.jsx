import React from 'react';

import { Throbber, BIG } from './throbber';


export default ({ loading, children, fullPage }) => (
  <div className={`loader-container ${fullPage ? '-full' : ''}`}>
    {loading
      ? (
        <div className="loader-overlay">
          <Throbber size={BIG} />
        </div>
      )
      : false
    }
    {children}
  </div>
);
