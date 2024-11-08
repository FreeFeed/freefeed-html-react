import cn from 'classnames';
import { useContext, useId, useRef } from 'react';
import { useEvent } from 'react-use-event-hook';
import { Autocomplete } from '../autocomplete/autocomplete';
import style from './advanced-search-form.module.scss';
import { filtersContext } from './context';
import { removeFilter, setFilter } from './reducer';
import { usernameFilters } from './helpers';

const autocompleteAnchor = /^|[^a-z\d]/gi;

export function TextInput({ label, placeholder = '', type = 'text', filter }) {
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
  const input = useRef();
  const withAutocomplete = usernameFilters.has(filter);
  return (
    <div className={style.inputRow}>
      <label htmlFor={id}>{label}</label>
      <div className={style.textInputBox}>
        <input
          ref={input}
          type={type}
          className={cn('form-control', style.textInput, value !== '' && style.textInputChosen)}
          placeholder={placeholder}
          id={id}
          onChange={onChange}
          value={value}
        />
        {withAutocomplete ? (
          <div className={style.autocompleteBox}>
            <Autocomplete inputRef={input} context="search" anchor={autocompleteAnchor} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
