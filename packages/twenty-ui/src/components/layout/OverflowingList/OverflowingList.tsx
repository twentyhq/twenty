import { useControlled } from '@base-ui/utils/useControlled';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { isFunction, isUndefined } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type ComponentProps, useCallback, useRef, useState } from 'react';

import { Popover } from '@ui/primitives/surfaces/Popover/Popover';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './OverflowingList.module.scss';
import { focusOverflowingListFallback } from './internal/focusOverflowingListFallback';
import { OverflowingListPopupTarget } from './internal/OverflowingListPopupTarget';
import { OverflowingListItem } from './internal/OverflowingListItem';
import { OverflowingListLayoutEffect } from './internal/OverflowingListLayoutEffect';
import { useOverflowingListLayout } from './internal/useOverflowingListLayout';
import { useFocusedElementUnmountRef } from './internal/useFocusedElementUnmountRef';
import { type OverflowingListProps } from './types/OverflowingListProps';

type PopoverActions = NonNullable<
  ComponentProps<typeof Popover.Root>['actionsRef']
>['current'];

export const OverflowingList = ({
  children,
  showOverflowCount,
  maxInlineCount,
  overflowLabel = 'Show all items',
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
  const [focusedItemCountVisibility, setFocusedItemCountVisibility] =
    useState<boolean>();
  const isCountVisible =
    showOverflowCount ??
    focusedItemCountVisibility ??
    (isHovered || hasFocus || isOpen);
  const inlineItemCount =
    isDefined(maxInlineCount) && Number.isFinite(maxInlineCount)
      ? Math.min(children.length, Math.max(0, Math.floor(maxInlineCount)))
      : children.length;
  const isMeasurementEnabled =
    (showOverflowCount ?? (isHovered || hasFocus)) || isOpen;
  const {
    containerRef,
    itemsRef,
    triggerRef,
    visibleItemCount,
    hasOverflow,
    updateLayout,
  } = useOverflowingListLayout({
    itemCount: children.length,
    inlineItemCount,
  });
  const canExpand = hasOverflow && (isOpen || showOverflowCount !== false);
  const isPopupOpen = isOpen && canExpand;
  const restoreItemFocus = useStableCallback(
    ({
      index,
      element,
      isInPopup,
    }: {
      index: number;
      element: HTMLElement;
      isInPopup: boolean;
    }) => {
      focusOverflowingListFallback({
        items: isInPopup && canExpand ? null : itemsRef.current,
        popup: isInPopup && isPopupOpen ? popup : null,
        trigger: triggerRef.current,
        root: containerRef.current,
        removedIndex: index,
        excludedItem: element,
      });
    },
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

    if (!canExpand) {
      focusOverflowingListFallback({
        items: itemsRef.current,
        popup: null,
        trigger: null,
        root: container,
        removedIndex: children.length,
      });
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
  const displayedItemCount =
    isMeasurementEnabled && showOverflowCount !== false
      ? visibleItemCount
      : inlineItemCount;
  const hiddenItemCount = children.length - visibleItemCount;

  const closeUnavailableOverflow = useStableCallback(() => {
    actionsRef.current?.close();
  });

  return (
    <>
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
          {children.slice(0, inlineItemCount).map((child, index) => (
            <OverflowingListItem
              key={child.key ?? index}
              index={index}
              isHidden={index >= displayedItemCount}
              isLastVisible={
                showOverflowCount !== false && index === displayedItemCount - 1
              }
              isInPopup={false}
              onFocusLost={restoreItemFocus}
            >
              {child}
            </OverflowingListItem>
          ))}
        </div>
        {(canExpand || isOpen) && (
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
            <Popover.Portal>
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
                  {children.map((child, index) => (
                    <OverflowingListItem
                      key={child.key ?? index}
                      index={index}
                      isHidden={false}
                      isLastVisible={false}
                      isInPopup
                      onFocusLost={restoreItemFocus}
                    >
                      {child}
                    </OverflowingListItem>
                  ))}
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        )}
      </div>
      <OverflowingListLayoutEffect
        containerRef={containerRef}
        itemsRef={itemsRef}
        triggerRef={triggerRef}
        itemCount={children.length}
        inlineItemCount={inlineItemCount}
        reserveCountSpace={isCountVisible}
        isMeasurementEnabled={isMeasurementEnabled}
        isOpen={isOpen}
        onLayoutChange={updateLayout}
        onOverflowUnavailable={closeUnavailableOverflow}
      />
    </>
  );
};
