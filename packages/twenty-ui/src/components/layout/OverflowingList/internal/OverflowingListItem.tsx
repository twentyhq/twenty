import { useStableCallback } from '@base-ui/utils/useStableCallback';
import {
  type ReactElement,
  type RefObject,
  useLayoutEffect,
  useState,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../OverflowingList.module.scss';

type OverflowingListItemProps = {
  children: ReactElement;
  index: number;
  isHidden: boolean;
  isLastVisible: boolean;
  isInPopup: boolean;
  itemsRef: RefObject<HTMLDivElement | null>;
  popup: HTMLDivElement | null;
  onFocusLost: (options: { index: number; element: HTMLElement }) => void;
};

const setItemAttribute = ({
  element,
  name,
  isEnabled,
}: {
  element: HTMLElement;
  name: string;
  isEnabled: boolean;
}) => {
  if (isEnabled) {
    element.setAttribute(name, '');
    return;
  }

  element.removeAttribute(name);
};

export const OverflowingListItem = ({
  children,
  index,
  isHidden,
  isLastVisible,
  isInPopup,
  itemsRef,
  popup,
  onFocusLost,
}: OverflowingListItemProps) => {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const wasInPopupRef = useRef(false);
  const handleFocusLost = useStableCallback((itemElement: HTMLElement) => {
    if (itemElement.contains(itemElement.ownerDocument.activeElement)) {
      onFocusLost({ index, element: itemElement });
    }
  });

  useLayoutEffect(() => {
    const items = itemsRef.current;

    if (!isDefined(items)) {
      return;
    }

    const itemElement = items.ownerDocument.createElement(
      items.localName,
    ) as HTMLDivElement;
    itemElement.className = styles.item;
    setElement(itemElement);

    return () => {
      handleFocusLost(itemElement);
      itemElement.remove();
    };
  }, [itemsRef, handleFocusLost]);

  useLayoutEffect(() => {
    const destination =
      isInPopup && isDefined(popup) ? popup : itemsRef.current;

    if (!isDefined(element) || !isDefined(destination)) {
      return;
    }

    const activeElement = element.ownerDocument.activeElement;
    const hadFocus = element.contains(activeElement);
    element.setAttribute('data-item-index', String(index));
    setItemAttribute({ element, name: 'data-hidden', isEnabled: isHidden });
    setItemAttribute({
      element,
      name: 'data-last-visible',
      isEnabled: isLastVisible,
    });
    setItemAttribute({ element, name: 'inert', isEnabled: isHidden });

    element.setAttribute('aria-hidden', String(isHidden));

    const nextItem = Array.from(destination.children).find(
      (item) =>
        item !== element &&
        Number(item.getAttribute('data-item-index')) > index,
    );
    const hasChangedPosition =
      element.parentElement !== destination ||
      element.nextElementSibling !== (nextItem ?? null);

    if (hasChangedPosition) {
      destination.insertBefore(element, nextItem ?? null);
    }

    const wasInPopup = wasInPopupRef.current;
    wasInPopupRef.current = isInPopup;

    if (hadFocus && isHidden && !wasInPopup) {
      onFocusLost({ index, element });
    }

    if (hadFocus && isHidden) {
      return;
    }

    if (hadFocus && hasChangedPosition) {
      (activeElement as HTMLElement).focus();
    }
  }, [
    element,
    index,
    isHidden,
    isInPopup,
    isLastVisible,
    itemsRef,
    popup,
    onFocusLost,
  ]);

  return isDefined(element) ? createPortal(children, element) : null;
};
