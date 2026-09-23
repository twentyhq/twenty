import { type DropdownFocusTarget } from './DropdownFocusTarget';
import { getDropdownFocusTarget } from './getDropdownFocusTarget';

export const scheduleDropdownPageFocus = ({
  content,
  pageId,
  target,
}: {
  content: HTMLElement;
  pageId?: string;
  target?: DropdownFocusTarget;
}) => {
  requestAnimationFrame(() => {
    if (
      !content.isConnected ||
      !content.hasAttribute('data-open') ||
      content.dataset.dropdownPageId !== pageId ||
      content.ownerDocument.activeElement !== content
    ) {
      return;
    }

    getDropdownFocusTarget({ content, target }).focus();
  });
};
