import pt from 'prop-types';
import { Component } from 'react';
import classnames from 'classnames';
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';

import { Icon } from '../fontawesome-icons';
import { lazyComponent } from '../lazy-component';
import { openLightbox } from '../../services/lightbox';
import { attachmentPreviewUrl } from '../../services/api';
import ImageAttachment, { previewSizes } from './post-attachment-image';

const bordersSize = 4;
const spaceSize = 8;
const arrowSize = 24;

const Sortable = lazyComponent(() => import('../react-sortable'), {
  fallback: <div>Loading component...</div>,
  errorMessage: "Couldn't load Sortable component",
});

export default class ImageAttachmentsContainer extends Component {
  static propTypes = {
    attachments: pt.array.isRequired,
    isSinglePost: pt.bool,
    isEditing: pt.bool,
    isNSFW: pt.bool,
    removeAttachment: pt.func,
    reorderImageAttachments: pt.func,
    postId: pt.string,
  };

  state = {
    containerWidth: 0,
    isFolded: true,
    needsFolding: false,
  };

  container = null;

  getItemWidths() {
    return this.props.attachments
      .map((att) => previewSizes(att).width)
      .map((w) => w + bordersSize + spaceSize);
  }

  getContentWidth() {
    return this.getItemWidths().reduce((s, w) => s + w, 0);
  }

  handleResize = () => {
    const containerWidth = this.container.scrollWidth;
    if (containerWidth !== this.state.containerWidth) {
      this.setState({
        containerWidth,
        needsFolding: containerWidth < this.getContentWidth(),
      });
    }
  };

  toggleFolding = () => {
    this.setState({ isFolded: !this.state.isFolded });
  };

  handleClickThumbnail(index) {
    return (e) => {
      if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }
      e.preventDefault();
      openLightbox(index, this.getPswpItems(), e.target);
    };
  }

  getPswpItems() {
    return this.props.attachments.map((a) => ({
      src: attachmentPreviewUrl(a.id, 'image'),
      width: a.previewWidth ?? a.width,
      height: a.previewHeight ?? a.height,
      pid: this.getPictureId(a),
    }));
  }

  getPictureId(a) {
    return `${this.props.postId?.slice(0, 8) ?? 'new-post'}-${a.id.slice(0, 8)}`;
  }

  componentDidMount() {
    if (!this.props.isSinglePost && this.props.attachments.length > 1) {
      window.addEventListener('resize', this.handleResize);
      this.handleResize();
    }
  }

  componentWillUnmount() {
    if (!this.props.isSinglePost && this.props.attachments.length > 1) {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  registerContainer = (el) => {
    this.container = el;
  };

  setSortedList = (list) => this.props.reorderImageAttachments(list.map((it) => it.id));

  render() {
    const isSingleImage = this.props.attachments.length === 1;
    const withSortable = this.props.isEditing && this.props.attachments.length > 1;
    const className = classnames({
      'image-attachments': true,
      'is-folded': this.state.isFolded,
      'needs-folding': this.state.needsFolding,
      'single-image': isSingleImage,
      'sortable-images': withSortable,
    });

    const showFolded = this.state.needsFolding && this.state.isFolded && !this.props.isEditing;
    let lastVisibleIndex = 0;
    if (showFolded) {
      let width = 0;
      this.getItemWidths().forEach((w, i) => {
        width += w;
        if (width + arrowSize < this.state.containerWidth) {
          lastVisibleIndex = i;
        }
      });
    }

    const allImages = this.props.attachments.map((a, i) => (
      <ImageAttachment
        key={a.id}
        isEditing={this.props.isEditing}
        handleClick={this.handleClickThumbnail(i)}
        removeAttachment={this.props.removeAttachment}
        isHidden={showFolded && i > lastVisibleIndex}
        pictureId={this.getPictureId(a)}
        isNSFW={this.props.isNSFW}
        {...a}
      />
    ));

    return (
      <div className={className} ref={this.registerContainer}>
        {withSortable ? (
          <Sortable
            list={this.props.attachments}
            setList={this.setSortedList}
            filter=".remove-attachment"
            /* Bug on iOS, see https://github.com/SortableJS/react-sortablejs/issues/270 */
            preventOnFilter={false}
          >
            {allImages}
          </Sortable>
        ) : (
          allImages
        )}
        {isSingleImage || this.props.isEditing ? (
          false
        ) : (
          <div className="show-more">
            <Icon
              icon={faChevronCircleRight}
              className="show-more-icon"
              onClick={this.toggleFolding}
              title={
                this.state.isFolded
                  ? `Show more (${this.props.attachments.length - lastVisibleIndex - 1})`
                  : 'Show less'
              }
            />
          </div>
        )}
      </div>
    );
  }
}
