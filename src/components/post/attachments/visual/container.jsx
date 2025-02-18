import { VisualContainerEditable } from './container-editable';
import { VisualContainerStatic } from './container-static';

export function VisualContainer(props) {
  if (props.removeAttachment || props.reorderImageAttachments) {
    return <VisualContainerEditable {...props} />;
  }
  return <VisualContainerStatic {...props} />;
}
