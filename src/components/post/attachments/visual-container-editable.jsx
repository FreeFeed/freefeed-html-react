import cn from 'classnames';
import { useEvent } from 'react-use-event-hook';
import { lazyComponent } from '../../lazy-component';
import style from './attachments.module.scss';
import { useItemClickHandler, useLightboxItems } from './hooks';
import {
  fitIntoBox,
  galleryGap,
  maxEditingPreviewHeight,
  maxEditingPreviewWidth,
  minEditingPreviewHeight,
  minEditingPreviewWidth,
} from './geometry';
import { VisualAttachment } from './visual';

const Sortable = lazyComponent(() => import('../../react-sortable'), {
  fallback: <div>Loading component...</div>,
  errorMessage: "Couldn't load Sortable component",
});

export function VisualContainerEditable({
  attachments,
  removeAttachment,
  reorderImageAttachments,
  postId,
}) {
  const withSortable = attachments.length > 1;
  const lightboxItems = useLightboxItems(attachments, postId);
  const handleClick = useItemClickHandler(lightboxItems);

  const setSortedList = useEvent((list) => reorderImageAttachments(list.map((a) => a.id)));

  const previews = [];

  // Use the single container and the fixed legacy sizes for the reorder ability
  for (const [i, a] of attachments.entries()) {
    const { width, height } = fitIntoBox(a, maxEditingPreviewWidth, maxEditingPreviewHeight, true);
    previews.push(
      <VisualAttachment
        key={a.id}
        attachment={a}
        removeAttachment={removeAttachment}
        reorderImageAttachments={reorderImageAttachments}
        postId={postId}
        width={Math.max(width, minEditingPreviewWidth)}
        height={Math.max(height, minEditingPreviewHeight)}
        pictureId={lightboxItems[i].pid}
        handleClick={handleClick}
      />,
    );
  }

  return (
    <div style={{ '--gap': `${galleryGap}px` }}>
      {withSortable ? (
        <Sortable
          className={cn(
            style['container'],
            style['container--visual'],
            withSortable && style['container--sortable'],
          )}
          list={attachments}
          setList={setSortedList}
          filter={`.${style['visual__overlay--button']},.${style['visual__filler']}`}
          /* Bug on iOS, see https://github.com/SortableJS/react-sortablejs/issues/270 */
          preventOnFilter={false}
        >
          {previews}
        </Sortable>
      ) : (
        <div className={cn(style['container'], style['container--visual'])}>{previews}</div>
      )}
    </div>
  );
}
