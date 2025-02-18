import cn from 'classnames';
import { faInstagram, faVimeo, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import { faFilm } from '@fortawesome/free-solid-svg-icons';
import { T_VIMEO_VIDEO, T_YOUTUBE_VIDEO } from '../link-preview/video';
import { Icon } from '../fontawesome-icons';
import { IMAGE, INSTAGRAM, useMediaLink, VIDEO } from './helpers';

export function MediaLink({ href: url, children }) {
  const [mediaType, handleClick] = useMediaLink(url);

  const mediaIcon = {
    [INSTAGRAM]: faInstagram,
    [T_YOUTUBE_VIDEO]: faYoutube,
    [T_VIMEO_VIDEO]: faVimeo,
    [IMAGE]: faImage,
    [VIDEO]: faFilm,
  }[mediaType];

  const mediaProps = mediaIcon
    ? {
        onClick: handleClick,
        className: cn('media-link', mediaType),
        title: 'Click to view in Lightbox',
      }
    : {};

  return (
    <a href={url} target="_blank" dir="ltr" {...mediaProps}>
      {mediaIcon && (
        <span className="icon-bond">
          <Icon icon={mediaIcon} className="media-icon" />
        </span>
      )}
      {children}
    </a>
  );
}
