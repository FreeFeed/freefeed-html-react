import { filesize } from 'filesize';
import cn from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { faExclamationTriangle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useEvent } from 'react-use-event-hook';
import { createAttachment, resetAttachmentUpload } from '../../redux/action-creators';
import { ButtonLink } from '../button-link';
import { Icon } from '../fontawesome-icons';
import { initialAsyncState } from '../../redux/async-helpers';
import style from './progress.module.scss';
import { useSpeed } from './use-speed';

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
  const upl = allUploads[id];

  const remove = useEvent(() => {
    if (status.loading && !confirm('Are you sure you want to abort the upload?')) {
      return;
    }
    dispatch(resetAttachmentUpload(id));
  });
  const retry = useEvent(() => dispatch(createAttachment(id, file)));

  const speed = useSpeed(status.progress * (upl?.size ?? 0));

  if (!status.loading && !status.error) {
    return null;
  }

  return (
    <div className={cn(style.row, status.error && style.rowError)}>
      <div className={style.name}>{upl?.name ?? 'File'}</div>
      {status.error ? (
        <>
          <div className={style.error}>
            <Icon icon={faExclamationTriangle} /> {status.errorText}
          </div>
          {status.errorText === 'Network error' && (
            <button className="btn btn-xs btn-default" onClick={retry}>
              Retry
            </button>
          )}
        </>
      ) : (
        <div className={style.speed}>{filesize(speed, { bits: true })}/s</div>
      )}
      <ButtonLink
        className={style.closeIcon}
        onClick={remove}
        data-id={id}
        title={status.error ? 'Remove' : 'Abort'}
      >
        <Icon icon={faTimesCircle} />
      </ButtonLink>
      <div
        className={style.progress}
        style={{ width: `${(status.error ? 1 : status.progress) * 100}%` }}
      />
    </div>
  );
}
