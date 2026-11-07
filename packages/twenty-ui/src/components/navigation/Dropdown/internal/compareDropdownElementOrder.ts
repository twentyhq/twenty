import { isDefined } from '@ui/utilities/utils/isDefined';

export const compareDropdownElementOrder = ({
  firstElement,
  secondElement,
}: {
  firstElement: HTMLElement;
  secondElement: HTMLElement;
}) => {
  if (firstElement === secondElement) {
    return 0;
  }

  const documentOrder =
    (firstElement.compareDocumentPosition(secondElement) &
      Node.DOCUMENT_POSITION_FOLLOWING) !==
    0
      ? -1
      : 1;
  let firstBranch = firstElement;

  while (
    isDefined(firstBranch.parentElement) &&
    !firstBranch.parentElement.contains(secondElement)
  ) {
    firstBranch = firstBranch.parentElement;
  }

  const commonParent = firstBranch.parentElement;
  const ownerWindow = commonParent?.ownerDocument.defaultView;

  if (!isDefined(commonParent) || !isDefined(ownerWindow)) {
    return documentOrder;
  }

  let secondBranch = secondElement;

  while (
    isDefined(secondBranch.parentElement) &&
    secondBranch.parentElement !== commonParent
  ) {
    secondBranch = secondBranch.parentElement;
  }

  if (firstBranch === secondBranch) {
    return documentOrder;
  }

  const parentStyle = ownerWindow.getComputedStyle(commonParent);
  const isFlexParent =
    parentStyle.display === 'flex' || parentStyle.display === 'inline-flex';

  if (!isFlexParent) {
    return documentOrder;
  }

  const firstOrder = Number(ownerWindow.getComputedStyle(firstBranch).order);
  const secondOrder = Number(ownerWindow.getComputedStyle(secondBranch).order);
  const elementOrder = firstOrder - secondOrder || documentOrder;

  return parentStyle.flexDirection === 'column-reverse'
    ? -elementOrder
    : elementOrder;
};
