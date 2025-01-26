import { PureComponent, createRef } from 'react';
import classnames from 'classnames';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { formatFileSize } from '../../utils';
import { Icon } from '../fontawesome-icons';
import { attachmentPreviewUrl } from '../../services/api';

const NSFW_PREVIEW_AREA = 20;

const previewMaxWidth = 525;
const previewMaxHeight = 175;

class PostAttachmentImage extends PureComponent {
  canvasRef = createRef(null);

  handleRemoveImage = () => {
    this.props.removeAttachment(this.props.id);
  };

  componentDidMount() {
    const nsfwCanvas = this.canvasRef.current;
    if (!nsfwCanvas) {
      return;
    }
    const { width, height } = previewSizes(this.props);
    const ctx = nsfwCanvas.getContext('2d');
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 0, nsfwCanvas.width, nsfwCanvas.height);
    const img = new Image();
    img.onload = () =>
      nsfwCanvas.isConnected && ctx.drawImage(img, 0, 0, nsfwCanvas.width, nsfwCanvas.height);
    img.src = attachmentPreviewUrl(this.props.id, 'image', width, height);
  }

  render() {
    const { props } = this;

    const formattedFileSize = formatFileSize(props.fileSize);
    const formattedImageSize = `, ${props.width}×${props.height}px`;
    const nameAndSize = `${props.fileName} (${formattedFileSize}${formattedImageSize})`;
    const alt = `Image attachment ${props.fileName}`;

    const { width, height } = previewSizes(this.props);

    const imageAttributes = {
      src: attachmentPreviewUrl(props.id, 'image', width, height),
      srcSet: `${attachmentPreviewUrl(props.id, 'image', width * 2, height * 2)} 2x`,
      alt,
      id: props.pictureId,
      loading: 'lazy',
      width,
      height,
    };

    const area = width * height;
    const canvasWidth = Math.round(width * Math.sqrt(NSFW_PREVIEW_AREA / area));
    const canvasHeight = Math.round(height * Math.sqrt(NSFW_PREVIEW_AREA / area));

    return (
      <div
        className={classnames({ attachment: true, hidden: props.isHidden })}
        data-id={props.id}
        role="figure"
      >
        <a
          href={props.url}
          title={nameAndSize}
          onClick={props.handleClick}
          target="_blank"
          className="image-attachment-link"
        >
          {props.isNSFW && (
            <canvas
              ref={this.canvasRef}
              className="image-attachment-nsfw-canvas"
              width={canvasWidth}
              height={canvasHeight}
            />
          )}
          <img className="image-attachment-img" {...imageAttributes} />
        </a>

        {props.isEditing && (
          <Icon
            icon={faTimes}
            className="remove-attachment"
            title="Remove image"
            onClick={this.handleRemoveImage}
          />
        )}
      </div>
    );
  }
}

export default PostAttachmentImage;

export function previewSizes(att) {
  return fitIntoBox(
    att.previewWidth ?? att.width,
    att.previewHeight ?? att.height,
    previewMaxWidth,
    previewMaxHeight,
  );
}

function fitIntoBox(width, height, boxWidth, boxHeight) {
  const wRatio = width / boxWidth;
  const hRatio = height / boxHeight;

  if (wRatio > hRatio) {
    return { width: boxWidth, height: Math.round(height / wRatio) };
  }

  return { width: Math.round(width / hRatio), height: boxHeight };
}
