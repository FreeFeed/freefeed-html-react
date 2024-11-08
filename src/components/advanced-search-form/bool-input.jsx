import { useEvent } from 'react-use-event-hook';
import { useContext } from 'react';
import { removeFilter, setFilter } from './reducer';
import { filtersContext } from './context';

export function BoolInput({ label, filter }) {
  const [filters, dispatch] = useContext(filtersContext);
  const onChange = useEvent((e) => {
    if (e.target.checked) {
      dispatch(setFilter(filter, ''));
    } else {
      dispatch(removeFilter(filter));
    }
  });
  return (
    <div className="checkbox">
      <label>
        <input type="checkbox" checked={filter in filters} onChange={onChange} />
        {label}
      </label>
    </div>
  );
}
