import { isDefined } from '@ui/utilities/utils/isDefined';

import { isTabbableElement } from './isTabbableElement';

const FOCUSABLE_ELEMENT_SELECTOR = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

export const getDropdownTabOutTarget = ({
  content,
  rootTriggerId,
}: {
  content: HTMLElement;
  rootTriggerId: string | undefined;
}) => {
  const rootTrigger = isDefined(rootTriggerId)
    ? content.ownerDocument.getElementById(rootTriggerId)
    : null;

  if (!isDefined(rootTrigger)) {
    return undefined;
  }

  return Array.from(
    content.ownerDocument.querySelectorAll<HTMLElement>(
      FOCUSABLE_ELEMENT_SELECTOR,
    ),
  ).find(
    (element) =>
      !rootTrigger.contains(element) &&
      (rootTrigger.compareDocumentPosition(element) &
        rootTrigger.DOCUMENT_POSITION_FOLLOWING) !==
        0 &&
      element.closest('[data-dropdown-content]') === null &&
      isTabbableElement(element),
  );
};
