import cn from 'classnames';
import { useRef } from 'react';
import { clamp } from 'lodash-es';
import style from './attachments.module.scss';
import { useItemClickHandler, useLightboxItems, useWidthOf } from './hooks';
import {
  fitIntoBox,
  galleryGap,
  getGallerySizes,
  maxPreviewAspectRatio,
  singleImageMaxHeight,
  singleImageThumbArea,
  thumbArea,
} from './geometry';
import { VisualAttachment } from './visual';

export function VisualContainerStatic({
  attachments,
  isNSFW,
  removeAttachment,
  reorderImageAttachments,
  postId,
}) {
  const containerRef = useRef(null);
  const containerWidth = useWidthOf(containerRef);

  const lightboxItems = useLightboxItems(attachments, postId);
  const handleClick = useItemClickHandler(lightboxItems);

  const ratios = attachments.map((a) =>
    clamp(a.width / a.height, 1 / maxPreviewAspectRatio, maxPreviewAspectRatio),
  );

  const singleImage = attachments.length === 1;

  const sizeRows = getGallerySizes(
    ratios,
    containerWidth,
    singleImage ? singleImageThumbArea : thumbArea,
    galleryGap,
  );

  if (singleImage && sizeRows[0].items[0].height > singleImageMaxHeight) {
    sizeRows[0].items[0] = fitIntoBox(
      attachments[0],
      singleImageMaxHeight,
      singleImageMaxHeight,
      true,
    );
    sizeRows[0].stretched = false;
  }

  if (containerWidth === 0) {
    // Looks like a first render, don't render content
    return <div ref={containerRef} />;
  }

  const previews = [];

  // Use multiple rows and the dynamic sizes
  let n = 0;
  for (const row of sizeRows) {
    const atts = attachments.slice(n, n + row.items.length);
    const key = atts.map((a) => a.id).join('-');
    previews.push(
      <div
        key={key}
        className={cn(
          style['container-visual__row'],
          row.stretched && style['container-visual__row--stretched'],
        )}
      >
        {atts.map((a, i) => (
          <VisualAttachment
            key={a.id}
            attachment={a}
            removeAttachment={removeAttachment}
            reorderImageAttachments={reorderImageAttachments}
            postId={postId}
            isNSFW={isNSFW}
            width={row.items[i].width}
            height={row.items[i].height}
            pictureId={lightboxItems[n + i].pid}
            handleClick={handleClick}
          />
        ))}
      </div>,
    );
    n += atts.length;
  }

  return (
    <div style={{ '--gap': `${galleryGap}px` }} ref={containerRef}>
      <div className={cn(style['container'], style['container--visual'])}>{previews}</div>
    </div>
  );
}
