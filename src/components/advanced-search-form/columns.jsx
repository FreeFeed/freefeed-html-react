import { Children } from 'react';
import style from './advanced-search-form.module.scss';

export function Columns({ children }) {
  const nRows = Math.ceil(countElements(children) / 2);
  return (
    <div className={style.columns} style={{ '--n-rows': nRows }}>
      {children}
    </div>
  );
}

function countElements(children) {
  let n = 0;
  Children.forEach(children, (child) => {
    if (!child) {
      return;
    }
    if (child.type === Symbol.for('react.fragment')) {
      n += countElements(child.props.children);
    } else {
      n++;
    }
  });
  return n;
}
