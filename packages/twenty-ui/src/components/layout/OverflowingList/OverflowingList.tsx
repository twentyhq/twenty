import { useControlled } from '@base-ui/utils/useControlled';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { isFunction, isUndefined } from '@sniptt/guards';
import { clsx } from 'clsx';
import {
  type ComponentProps,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Popover } from '@ui/primitives/surfaces/Popover/Popover';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './OverflowingList.module.scss';
import { focusOverflowingListFallback } from './internal/focusOverflowingListFallback';
import { OverflowingListPopupTarget } from './internal/OverflowingListPopupTarget';
import { OverflowingListItem } from './internal/OverflowingListItem';
import { useOverflowingListLayout } from './internal/useOverflowingListLayout';
import { useOverflowingListClientLayout } from './internal/useOverflowingListClientLayout';
import { useFocusedElementUnmountRef } from './internal/useFocusedElementUnmountRef';
import { type OverflowingListProps } from './types/OverflowingListProps';

type PopoverActions = NonNullable<
  ComponentProps<typeof Popover.Root>['actionsRef']
>['current'];

export const OverflowingList = ({
  children,
  showOverflowCount,
  maxInlineCount,
  overflowLabel = 'Show hidden items',
  open,
  defaultOpen = false,
  onOpenChange,
  triggerProps,
  popupProps,
  className,
  onMouseEnter,
  onMouseLeave,
  onFocusCapture,
  onBlurCapture,
  ref,
  ...props
}: OverflowingListProps) => {
  const hasClientLayout = useOverflowingListClientLayout();
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [popup, setPopup] = useState<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useControlled({
    controlled: open,
    default: defaultOpen,
    name: 'OverflowingList',
    state: 'open',
  });
  const actionsRef = useRef<PopoverActions>(null);
  const unavailableCloseRequestedRef = useRef(false);
  const [focusedItemCountVisibility, setFocusedItemCountVisibility] =
    useState<boolean>();
  const isCountVisible =
    showOverflowCount ??
    (isOpen || (focusedItemCountVisibility ?? (isHovered || hasFocus)));
  const inlineItemCount =
    isDefined(maxInlineCount) && Number.isFinite(maxInlineCount)
      ? Math.min(children.length, Math.max(0, Math.floor(maxInlineCount)))
      : children.length;
  const {
    containerRef,
    itemsRef,
    triggerRef,
    visibleItemCount,
    hasOverflow,
    isMeasured,
  } = useOverflowingListLayout({
    itemCount: children.length,
    inlineItemCount,
    reserveCountSpace: isCountVisible,
    popup,
  });
  const canExpand = hasOverflow && showOverflowCount !== false;
  const isPopupOpen = isOpen && canExpand;
  const restoreItemFocus = useCallback(
    ({ index, element }: { index: number; element: HTMLElement }) => {
      focusOverflowingListFallback({
        items: itemsRef.current,
        popup: isPopupOpen ? popup : null,
        trigger: triggerRef.current,
        root: containerRef.current,
        removedIndex: index,
        excludedItem: element,
      });
    },
    [itemsRef, triggerRef, containerRef, popup, isPopupOpen],
  );
  const restoreTriggerFocus = useCallback(() => {
    const container = containerRef.current;
    container?.focus();
    setHasFocus(container?.ownerDocument.activeElement === container);
    setFocusedItemCountVisibility(undefined);
  }, [containerRef]);
  const restorePopupFocus = useStableCallback(() => {
    if (isPopupOpen) {
      return;
    }

    const container = containerRef.current;
    const document = container?.ownerDocument;
    const activeElement = document?.activeElement;
    const hasFocusedInlineItem =
      isDefined(activeElement) &&
      itemsRef.current?.contains(activeElement) &&
      !isDefined(activeElement.closest('[inert]'));
    const hasExternalFocus =
      isDefined(activeElement) &&
      activeElement !== document?.body &&
      !container?.contains(activeElement) &&
      !popup?.contains(activeElement);

    if (hasFocusedInlineItem || hasExternalFocus) {
      return;
    }

    const trigger = triggerRef.current;

    if (isDefined(trigger) && !trigger.matches(':disabled')) {
      trigger.focus({ preventScroll: true });
      return;
    }

    container?.focus({ preventScroll: true });
  });
  const schedulePopupFocusRestoration = useCallback(() => {
    queueMicrotask(restorePopupFocus);
    return false;
  }, [restorePopupFocus]);
  const resetFocusWhenFocusedTriggerUnmounts =
    useFocusedElementUnmountRef(restoreTriggerFocus);
  const mergedRef = useMergedRefs(containerRef, ref);
  const mergedTriggerRef = useMergedRefs(
    triggerRef,
    resetFocusWhenFocusedTriggerUnmounts,
    triggerProps?.ref,
  );
  const mergedPopupRef = useMergedRefs(setPopup, popupProps?.ref);
  const displayedItemCount = Math.min(inlineItemCount, visibleItemCount);
  const hiddenItemCount = children.length - displayedItemCount;

  useLayoutEffect(() => {
    if (!isOpen || canExpand) {
      unavailableCloseRequestedRef.current = false;
      return;
    }

    if (!isMeasured || unavailableCloseRequestedRef.current) {
      return;
    }

    unavailableCloseRequestedRef.current = true;
    actionsRef.current?.close();
  }, [isOpen, canExpand, isMeasured]);

  return (
    <Popover.Root
      open={isPopupOpen}
      actionsRef={actionsRef}
      onOpenChange={(nextOpen, eventDetails) => {
        onOpenChange?.(nextOpen, eventDetails);

        if (!eventDetails.isCanceled) {
          setIsOpen(nextOpen);
        }
      }}
    >
      <div
        {...props}
        ref={mergedRef}
        tabIndex={props.tabIndex ?? -1}
        className={clsx(styles.root, className)}
        onMouseEnter={(event) => {
          setIsHovered(true);
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          setIsHovered(false);
          onMouseLeave?.(event);
        }}
        onFocusCapture={(event) => {
          setHasFocus(true);

          if (itemsRef.current?.contains(event.target)) {
            setFocusedItemCountVisibility(
              (currentVisibility) => currentVisibility ?? isCountVisible,
            );
          }

          onFocusCapture?.(event);
        }}
        onBlurCapture={(event) => {
          const hasRelatedFocus =
            event.currentTarget.contains(event.relatedTarget) ||
            (popup?.contains(event.relatedTarget) ?? false);
          setHasFocus(hasRelatedFocus);

          if (!itemsRef.current?.contains(event.relatedTarget)) {
            setFocusedItemCountVisibility(undefined);
          }

          onBlurCapture?.(event);
        }}
      >
        <div ref={itemsRef} className={styles.items}>
          {!hasClientLayout &&
            children.slice(0, inlineItemCount).map((child, index) => (
              <div
                key={child.key ?? index}
                className={styles.item}
                data-item-index={index}
              >
                {child}
              </div>
            ))}
        </div>
        {canExpand && (
          <Popover.Trigger
            type="button"
            aria-label={`+${hiddenItemCount} ${overflowLabel}`}
            {...triggerProps}
            ref={mergedTriggerRef}
            className={(state) =>
              clsx(
                styles.trigger,
                isFunction(triggerProps?.className)
                  ? triggerProps.className(state)
                  : triggerProps?.className,
              )
            }
            data-visible={isCountVisible || undefined}
          >
            {isUndefined(triggerProps?.children)
              ? `+${hiddenItemCount}`
              : triggerProps.children}
          </Popover.Trigger>
        )}
        <Popover.Portal keepMounted>
          <Popover.Positioner
            anchor={containerRef}
            align="start"
            sideOffset={-9}
            alignOffset={-7}
          >
            <Popover.Popup
              aria-label={overflowLabel}
              {...popupProps}
              ref={mergedPopupRef}
              render={(renderProps, state) => (
                <OverflowingListPopupTarget
                  props={renderProps}
                  state={state}
                  render={popupProps?.render}
                />
              )}
              finalFocus={
                popupProps?.finalFocus ?? schedulePopupFocusRestoration
              }
              className={(state) =>
                clsx(
                  styles.popup,
                  isFunction(popupProps?.className)
                    ? popupProps.className(state)
                    : popupProps?.className,
                )
              }
              data-overflowing-list-popup=""
            >
              {hasClientLayout &&
                children.map((child, index) => (
                  <OverflowingListItem
                    key={child.key ?? index}
                    index={index}
                    isHidden={index >= displayedItemCount && !isPopupOpen}
                    isLastVisible={
                      showOverflowCount !== false &&
                      index === displayedItemCount - 1
                    }
                    isInPopup={index >= displayedItemCount && isPopupOpen}
                    itemsRef={itemsRef}
                    popup={popup}
                    onFocusLost={restoreItemFocus}
                  >
                    {child}
                  </OverflowingListItem>
                ))}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </div>
    </Popover.Root>
  );
};
