import { useEffect, useRef } from 'react';
import style from './attachments.module.scss';

const NSFW_PREVIEW_AREA = 20;

export function NsfwCanvas({ aspectRatio, src }) {
  const canvasWidth = Math.round(Math.sqrt(NSFW_PREVIEW_AREA * aspectRatio));
  const canvasHeight = Math.round(Math.sqrt(NSFW_PREVIEW_AREA / aspectRatio));

  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => canvas.isConnected && ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = src;
  }, [src]);

  return (
    <>
      <canvas
        ref={ref}
        className={style['nsfw-canvas']}
        width={canvasWidth}
        height={canvasHeight}
      />
      <div className={style['nsfw-canvas__label']}>NSFW</div>
    </>
  );
}
