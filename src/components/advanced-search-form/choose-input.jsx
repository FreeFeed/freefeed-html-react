import cn from 'classnames';
import { useContext, useId } from 'react';
import { useEvent } from 'react-use-event-hook';
import style from './advanced-search-form.module.scss';
import { filtersContext } from './context';
import { removeFilter, setFilter } from './reducer';

export function ChooseInput({ label, children: options, filter }) {
  const id = useId();
  const [filters, dispatch] = useContext(filtersContext);
  const onChange = useEvent((e) => {
    const v = e.target.value;
    if (v.trim() !== '') {
      dispatch(setFilter(filter, v));
    } else {
      dispatch(removeFilter(filter));
    }
  });
  const value = filter in filters ? filters[filter] : '';
  return (
    <div className={style.inputRow}>
      <label htmlFor={id}>{label}</label>
      <select
        className={cn('form-control', style.selector, value !== '' && style.selectorChosen)}
        id={id}
        value={value}
        onChange={onChange}
      >
        {options}
      </select>
    </div>
  );
}
