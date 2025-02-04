import cn from 'classnames';
import { useRef, useMemo } from 'react';
import { useEvent } from 'react-use-event-hook';
import { attachmentPreviewUrl } from '../../../services/api';
import { openLightbox } from '../../../services/lightbox';
import { lazyComponent } from '../../lazy-component';
import style from './attachments.module.scss';
import { VisualAttachment } from './visual';
import { useWidthOf } from './use-width-of';
import { fitIntoBox, getGallerySizes } from './geometry';

const gap = 8; // px
const thumbArea = 210 ** 2; // px^2

const Sortable = lazyComponent(() => import('../../react-sortable'), {
  fallback: <div>Loading component...</div>,
  errorMessage: "Couldn't load Sortable component",
});

export function VisualContainer({
  attachments,
  isNSFW,
  removeAttachment,
  reorderImageAttachments,
  postId,
}) {
  const containerRef = useRef(null);
  const containerWidth = useWidthOf(containerRef);

  const ratios = attachments.map((a) => a.width / a.height);
  let sizes = getGallerySizes(ratios, containerWidth - 5, thumbArea, gap).flat();

  const singleImage = attachments.length === 1;
  const withSortable = !!removeAttachment && attachments.length > 1;

  if (singleImage) {
    sizes = [fitIntoBox(attachments[0], 500, 300)];
  }

  const lightboxItems = useMemo(
    () =>
      attachments.map((a) => ({
        ...(a.mediaType === 'image'
          ? { type: 'image', src: attachmentPreviewUrl(a.id, 'image') }
          : {
              type: 'video',
              videoSrc: attachmentPreviewUrl(a.id, 'video'),
              msrc: attachmentPreviewUrl(a.id, 'image'),
              meta: a.meta ?? {},
            }),
        originalSrc: attachmentPreviewUrl(a.id, 'original'),
        width: a.previewWidth ?? a.width,
        height: a.previewHeight ?? a.height,
        pid: `${postId?.slice(0, 8) ?? 'new-post'}-${a.id.slice(0, 8)}`,
      })),
    [attachments, postId],
  );

  const handleClick = useEvent((e) => {
    if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
    const { currentTarget: el } = e;
    const index = lightboxItems.findIndex((i) => i.pid === el.dataset.pid);
    openLightbox(index, lightboxItems, el.target);
  });

  const setSortedList = useEvent((list) => reorderImageAttachments(list.map((a) => a.id)));

  const previews = attachments.map((a, i) => (
    <VisualAttachment
      key={a.id}
      attachment={a}
      removeAttachment={removeAttachment}
      reorderImageAttachments={reorderImageAttachments}
      postId={postId}
      isNSFW={isNSFW}
      width={sizes[i].width}
      height={sizes[i].height}
      pictureId={lightboxItems[i].pid}
      handleClick={handleClick}
    />
  ));

  return (
    <div style={{ '--gap': `${gap}px` }} ref={containerRef}>
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
          <div className={style['visual__filler']} />
        </Sortable>
      ) : (
        <div
          className={cn(
            style['container'],
            style['container--visual'],
            withSortable && style['container--sortable'],
          )}
        >
          {previews}
          <div className={style['visual__filler']} />
        </div>
      )}
    </div>
  );
}
