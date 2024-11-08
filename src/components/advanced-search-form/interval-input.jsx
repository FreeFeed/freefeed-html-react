import { useContext, useId } from 'react';
import { useEvent } from 'react-use-event-hook';
import style from './advanced-search-form.module.scss';
import { filtersContext } from './context';
import { setFilter } from './reducer';

export function IntervalInput({ label, filter }) {
  const id = useId();
  const [filters, dispatch] = useContext(filtersContext);

  const value = filter in filters ? filters[filter] : '>=';
  const m = /^(<=?|>=?|=)?(\d+)?$/.exec(value);
  let op = '>=';
  let num = '';
  if (m) {
    op = m[1] || '=';
    // eslint-disable-next-line prefer-destructuring
    num = m[2] || '';
  }

  const onOpChange = useEvent((e) => {
    const v = e.target.value;
    dispatch(setFilter(filter, v + num));
  });

  const onNumChange = useEvent((e) => {
    const v = e.target.value;
    dispatch(setFilter(filter, op + v));
  });

  return (
    <div className={style.inputRow}>
      <label htmlFor={id}>{label}</label>
      <div className={style.intervalBox}>
        <select className="form-control" value={op} onChange={onOpChange}>
          <option value="&lt;">&lt;</option>
          <option value="&lt;=">&lt;=</option>
          <option value="=">=</option>
          <option value="&gt;=">&gt;=</option>
          <option value="&gt;">&gt;</option>
        </select>
        <input
          type="number"
          min="0"
          className="form-control"
          placeholder="0"
          id={id}
          value={num}
          onChange={onNumChange}
        />
      </div>
    </div>
  );
}
