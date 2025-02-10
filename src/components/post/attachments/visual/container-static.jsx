import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { clamp } from 'lodash-es';
import { faChevronCircleLeft, faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import { useEvent } from 'react-use-event-hook';
import { Icon } from '../../../fontawesome-icons';
import aStyle from '../attachments.module.scss';
import style from './visual.module.scss';
import { VisualAttachment } from './attachment';
import { useItemClickHandler, useLightboxItems, useWidthOf } from './hooks';
import {
  fitIntoBox,
  galleryGap,
  getGallerySizes,
  maxPreviewAspectRatio,
  singleImageMaxHeight,
  singleImageMinThumbArea,
  singleImageThumbArea,
  thumbArea,
} from './geometry';

export function VisualContainerStatic({
  attachments,
  isNSFW,
  removeAttachment,
  reorderImageAttachments,
  postId,
  isExpanded,
}) {
  const containerRef = useRef(null);
  const containerWidth = useWidthOf(containerRef);

  const lightboxItems = useLightboxItems(attachments, postId);
  const handleClick = useItemClickHandler(lightboxItems);

  const ratios = attachments.map((a) =>
    clamp(a.width / a.height, 1 / maxPreviewAspectRatio, maxPreviewAspectRatio),
  );

  const singleImage = attachments.length === 1;
  const singleImageArea = clamp(
    attachments[0].width * attachments[0].height,
    singleImageMinThumbArea,
    singleImageThumbArea,
  );

  const sizeRows = getGallerySizes(
    ratios,
    containerWidth,
    singleImage ? singleImageArea : thumbArea,
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

  const needFolding = sizeRows.length > 1 && !isExpanded;
  const [isFolded, setIsFolded] = useState(true);

  const toggleFold = useEvent(() => setIsFolded(!isFolded));

  useEffect(() => {
    if (!needFolding) {
      setIsFolded(true);
    }
  }, [needFolding]);

  if (containerWidth === 0) {
    // Looks like a first render, don't render content
    return <div ref={containerRef} />;
  }

  const previews = [];

  // Use multiple rows and the dynamic sizes
  let n = 0;
  for (let k = 0; k < sizeRows.length; k++) {
    const row = sizeRows[k];
    const atts = attachments.slice(n, n + row.items.length);
    const key = atts.map((a) => a.id).join('-');

    const showIcon =
      needFolding && ((!isFolded && k === sizeRows.length - 1) || (isFolded && k === 0));

    previews.push(
      <div key={key} className={cn(style['row'], row.stretched && style['row--stretched'])}>
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
        {showIcon && (
          <div className={style['fold__box']}>
            <button
              className={style['fold__icon']}
              onClick={toggleFold}
              title={isFolded ? `Show all (${attachments.length})` : 'Show less'}
            >
              <Icon icon={isFolded ? faChevronCircleRight : faChevronCircleLeft} />
            </button>
          </div>
        )}
      </div>,
    );
    n += atts.length;
    if (showIcon && isFolded) {
      // Show only the first row
      break;
    }
  }

  return (
    <div style={{ '--gap': `${galleryGap}px` }} ref={containerRef}>
      <div className={cn(aStyle['container'], style['container--visual'])}>{previews}</div>
    </div>
  );
}
