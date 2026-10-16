import { useControlled } from '@base-ui/utils/useControlled';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { isFunction, isUndefined } from '@sniptt/guards';
import { clsx } from 'clsx';
import {
  type ComponentProps,
  type SyntheticEvent,
  useRef,
  useState,
} from 'react';

import { Popover } from '@ui/primitives/surfaces/Popover/Popover';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './OverflowingList.module.scss';
import { OverflowingListPopupTarget } from './internal/OverflowingListPopupTarget';
import { OverflowingListItem } from './internal/OverflowingListItem';
import { OverflowingListLayoutEffect } from './internal/OverflowingListLayoutEffect';
import { useOverflowingListLayout } from './internal/useOverflowingListLayout';
import { useOverflowingListFocus } from './internal/useOverflowingListFocus';
import { type OverflowingListProps } from './types/OverflowingListProps';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

type PopoverActions = NonNullable<
  ComponentProps<typeof Popover.Root>['actionsRef']
>['current'];

const stopPropagation = (event: SyntheticEvent) => event.stopPropagation();

export const OverflowingList = ({
  children,
  showOverflowCount,
  maxInlineCount,
  overflowLabel = doNotTranslate('Show all items'),
  open,
  defaultOpen = false,
  onOpenChange,
  actionsRef,
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
  const [popup, setPopup] = useState<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useControlled({
    controlled: open,
    default: defaultOpen,
    name: doNotTranslate('OverflowingList'),
    state: 'open',
  });
  const internalActionsRef = useRef<PopoverActions>(null);
  const popoverActionsRef = actionsRef ?? internalActionsRef;
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
    updateLayout,
  } = useOverflowingListLayout({
    itemCount: children.length,
    inlineItemCount,
  });
  const canExpand = hasOverflow && (isOpen || showOverflowCount !== false);
  const isPopupOpen = isOpen && canExpand;
  const {
    hasFocus,
    isCountVisible,
    restoreItemFocus,
    schedulePopupFocusRestoration,
    resetFocusWhenFocusedTriggerUnmounts,
    handleFocusCapture,
    handleBlurCapture,
  } = useOverflowingListFocus({
    containerRef,
    itemsRef,
    triggerRef,
    popup,
    itemCount: children.length,
    canExpand,
    isPopupOpen,
    isOpen,
    isHovered,
    showOverflowCount,
    onFocusCapture,
    onBlurCapture,
  });
  const isMeasurementEnabled =
    (showOverflowCount ?? (isHovered || hasFocus)) || isOpen;
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
    popoverActionsRef.current?.close();
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
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
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
            actionsRef={popoverActionsRef}
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
                onClick={triggerProps?.onClick ?? stopPropagation}
                onMouseDown={triggerProps?.onMouseDown ?? stopPropagation}
                onPointerDown={triggerProps?.onPointerDown ?? stopPropagation}
                onKeyDown={triggerProps?.onKeyDown ?? stopPropagation}
                onKeyUp={triggerProps?.onKeyUp ?? stopPropagation}
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
                  onClick={popupProps?.onClick ?? stopPropagation}
                  onMouseDown={popupProps?.onMouseDown ?? stopPropagation}
                  onPointerDown={popupProps?.onPointerDown ?? stopPropagation}
                  onKeyDown={popupProps?.onKeyDown ?? stopPropagation}
                  onKeyUp={popupProps?.onKeyUp ?? stopPropagation}
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
