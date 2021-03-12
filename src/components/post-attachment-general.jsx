import { PureComponent } from 'react';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { formatFileSize } from '../utils';
import { Icon } from './fontawesome-icons';

class GeneralAttachment extends PureComponent {
  handleClickOnRemoveAttachment = () => {
    this.props.removeAttachment(this.props.id);
  };

  render() {
    const { props } = this;
    const formattedFileSize = formatFileSize(props.fileSize);
    const nameAndSize = `${props.fileName} (${formattedFileSize})`;

    return (
      <div className="attachment" role="figure" aria-label={`Attachment ${nameAndSize}`}>
        <a href={props.url} title={nameAndSize} target="_blank" rel="noopener">
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
