import { VisualContainerEditable } from './visual-container-editable';
import { VisualContainerStatic } from './visual-container-static';

export function VisualContainer(props) {
  if (props.removeAttachment || props.reorderImageAttachments) {
    return <VisualContainerEditable {...props} />;
  }
  return <VisualContainerStatic {...props} />;
}
