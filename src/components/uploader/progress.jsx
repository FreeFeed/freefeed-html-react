import cn from 'classnames';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { faExclamationTriangle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { createAttachment, resetAttachmentUpload } from '../../redux/action-creators';
import { ButtonLink } from '../button-link';
import { Icon } from '../fontawesome-icons';
import { initialAsyncState } from '../../redux/async-helpers';
import style from './progress.module.scss';

export function UploadProgress({ uploadIds, statuses, unfinishedFiles }) {
  return (
    <div className={style.container}>
      {[...uploadIds].map((id) => (
        <ProgressRow
          key={id}
          id={id}
          status={statuses[id] ?? initialAsyncState}
          file={unfinishedFiles.get(id)}
        />
      ))}
    </div>
  );
}

function ProgressRow({ id, status, file }) {
  const dispatch = useDispatch();
  const allUploads = useSelector((state) => state.attachmentUploads);

  const remove = useCallback(() => dispatch(resetAttachmentUpload(id)), [dispatch, id]);
  const retry = useCallback(() => dispatch(createAttachment(id, file)), [dispatch, id, file]);

  if (!status.loading && !status.error) {
    return null;
  }

  return (
    <div className={cn(style.row, status.error && style.rowError)}>
      <div className={style.name}>{allUploads[id]?.name ?? 'File'}</div>
      <div
        className={style.progress}
        style={{ width: `${(status.error ? 1 : status.progress) * 100}%` }}
      />
      {status.error && (
        <>
          <ButtonLink className={style.closeIcon} onClick={remove} data-id={id}>
            <Icon icon={faTimesCircle} />
          </ButtonLink>
          <div className={style.error}>
            <Icon icon={faExclamationTriangle} /> {status.errorText}
            {status.errorText === 'Network error' && (
              <>
                &nbsp;
                <button className="btn btn-xs btn-default" onClick={retry}>
                  Retry
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
