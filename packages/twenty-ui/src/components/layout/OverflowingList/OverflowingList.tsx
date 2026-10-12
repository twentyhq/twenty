import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { clsx } from 'clsx';
import { type SyntheticEvent, useCallback, useState } from 'react';

import { Popover } from '@ui/primitives/surfaces/Popover/Popover';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './OverflowingList.module.scss';
import { OverflowingListItem } from './internal/OverflowingListItem';
import { useOverflowingListLayout } from './internal/useOverflowingListLayout';
import { useFocusedElementUnmountRef } from './internal/useFocusedElementUnmountRef';
import { type OverflowingListProps } from './types/OverflowingListProps';

const stopPropagation = (event: SyntheticEvent) => event.stopPropagation();

const STOP_PROPAGATION_PROPS = {
  onClick: stopPropagation,
  onMouseDown: stopPropagation,
  onPointerDown: stopPropagation,
  onKeyDown: stopPropagation,
  onKeyUp: stopPropagation,
};

export const OverflowingList = ({
  children,
  showOverflowCount,
  maxInlineCount,
  overflowLabel = 'Show all items',
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
  const [isOpen, setIsOpen] = useState(false);
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
  const { containerRef, itemsRef, triggerRef, visibleItemCount, hasOverflow } =
    useOverflowingListLayout({
      itemCount: children.length,
      inlineItemCount,
      reserveCountSpace: isCountVisible,
      isMeasurementEnabled: showOverflowCount !== false || isOpen,
    });
  const resetFocusState = useCallback(() => {
    setHasFocus(false);
    setFocusedItemCountVisibility(undefined);
  }, []);
  const resetFocusWhenFocusedTriggerUnmounts =
    useFocusedElementUnmountRef(resetFocusState);
  const mergedRef = useMergedRefs(containerRef, ref);
  const mergedTriggerRef = useMergedRefs(
    triggerRef,
    resetFocusWhenFocusedTriggerUnmounts,
  );
  const displayedItemCount =
    showOverflowCount === false ? inlineItemCount : visibleItemCount;
  const hiddenItemCount = children.length - visibleItemCount;
  const canExpand = hasOverflow && (isOpen || showOverflowCount !== false);

  if (isOpen && !canExpand) {
    setIsOpen(false);
  }

  return (
    <Popover.Root open={isOpen && canExpand} onOpenChange={setIsOpen}>
      <div
        {...props}
        ref={mergedRef}
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
          setHasFocus(event.currentTarget.contains(event.relatedTarget));

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
              isHidden={index >= displayedItemCount}
              isLastVisible={
                showOverflowCount !== false && index === displayedItemCount - 1
              }
              onFocusedItemUnmount={resetFocusState}
            >
              {child}
            </OverflowingListItem>
          ))}
        </div>
        {canExpand && (
          <Popover.Trigger
            ref={mergedTriggerRef}
            type="button"
            className={styles.trigger}
            data-visible={isCountVisible || undefined}
            aria-label={`+${hiddenItemCount} ${overflowLabel}`}
            {...STOP_PROPAGATION_PROPS}
          >
            +{hiddenItemCount}
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
              className={styles.popup}
              data-overflowing-list-popup=""
              {...STOP_PROPAGATION_PROPS}
            >
              {children}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </div>
    </Popover.Root>
  );
};
