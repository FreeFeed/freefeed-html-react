import { PureComponent } from 'react';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { formatFileSize } from '../../utils';
import { Icon } from '../fontawesome-icons';

class GeneralAttachment extends PureComponent {
  handleClickOnRemoveAttachment = () => {
    this.props.removeAttachment(this.props.id);
  };

  handleClick = (e) => {
    if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }
    if (this.props.meta?.inProgress) {
      e.preventDefault();
      alert('This file is still being processed');
    }
  };

  render() {
    const { props } = this;
    const { inProgress = false } = props.meta ?? {};
    const formattedFileSize = formatFileSize(props.fileSize);
    const nameAndSize = `${props.fileName} (${inProgress ? 'processing...' : formattedFileSize})`;

    return (
      <div className="attachment" role="figure" aria-label={`Attachment ${nameAndSize}`}>
        <a href={props.url} title={nameAndSize} target="_blank">
          <Icon icon={faFile} className="attachment-icon" />
          <span className="attachment-title">{nameAndSize}</span>
        </a>

        {props.isEditing && (
          <Icon
            icon={faTimes}
            className="remove-attachment"
            title="Remove file"
            onClick={this.handleClickOnRemoveAttachment}
          />
        )}
      </div>
    );
  }
}

export default GeneralAttachment;
