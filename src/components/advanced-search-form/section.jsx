import cn from 'classnames';
import style from './advanced-search-form.module.scss';

export function Section({ title, children, sticky = false }) {
  return (
    <fieldset className={cn(style.section, sticky && style.sectionSticky)}>
      {title ? <legend className={style.sectionTitle}>{title}</legend> : null}
      {children}
    </fieldset>
  );
}
