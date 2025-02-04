import cn from 'classnames';
import { useRef, useMemo } from 'react';
import { useEvent } from 'react-use-event-hook';
import { attachmentPreviewUrl } from '../../../services/api';
import { openLightbox } from '../../../services/lightbox';
import { lazyComponent } from '../../lazy-component';
import style from './attachments.module.scss';
import { VisualAttachment } from './visual';
import { useWidthOf } from './use-width-of';
import { fitIntoBox, getGallerySizes, legacyThumbnailSize } from './geometry';

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
  let sizeRows = getGallerySizes(ratios, containerWidth - 1, thumbArea, gap);

  const singleImage = attachments.length === 1;
  const withSortable = !!removeAttachment && attachments.length > 1;

  if (singleImage) {
    sizeRows = [[fitIntoBox(attachments[0], 500, 300)]];
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

  const previews = [];
  if (withSortable) {
    // Use the single container and the fixed legacy sizes
    for (const [i, a] of attachments.entries()) {
      const { width, height } = legacyThumbnailSize(a);
      previews.push(
        <VisualAttachment
          key={a.id}
          attachment={a}
          removeAttachment={removeAttachment}
          reorderImageAttachments={reorderImageAttachments}
          postId={postId}
          isNSFW={isNSFW}
          width={width}
          height={height}
          pictureId={lightboxItems[i].pid}
          handleClick={handleClick}
        />,
      );
    }
  } else {
    // Use multiple rows and the dynamic sizes
    let n = 0;
    for (const sizes of sizeRows) {
      const atts = attachments.slice(n, n + sizes.length);
      const key = atts.map((a) => a.id).join('-');
      previews.push(
        <div key={key} className={style['container-visual__row']}>
          {atts.map((a, i) => (
            <VisualAttachment
              key={a.id}
              attachment={a}
              removeAttachment={removeAttachment}
              reorderImageAttachments={reorderImageAttachments}
              postId={postId}
              isNSFW={isNSFW}
              width={sizes[i].width}
              height={sizes[i].height}
              pictureId={lightboxItems[n + i].pid}
              handleClick={handleClick}
            />
          ))}
        </div>,
      );
      n += sizes.length;
    }
  }

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
        </div>
      )}
    </div>
  );
}
