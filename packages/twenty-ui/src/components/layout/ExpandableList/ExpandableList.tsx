import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { clsx } from 'clsx';
import { useLayoutEffect, useState } from 'react';

import { Popover } from '@ui/primitives/surfaces/Popover/Popover';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './ExpandableList.module.scss';
import { useExpandableListLayout } from './internal/useExpandableListLayout';
import { type ExpandableListProps } from './types/ExpandableListProps';

export const ExpandableList = ({
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
}: ExpandableListProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isCountVisible = showOverflowCount ?? (isHovered || hasFocus || isOpen);
  const inlineItemCount =
    isDefined(maxInlineCount) && Number.isFinite(maxInlineCount)
      ? Math.min(children.length, Math.max(0, Math.floor(maxInlineCount)))
      : children.length;
  const { containerRef, itemsRef, triggerRef, visibleItemCount, hasOverflow } =
    useExpandableListLayout({
      itemCount: children.length,
      inlineItemCount,
      reserveCountSpace: isCountVisible,
    });
  const mergedRef = useMergedRefs(containerRef, ref);
  const hiddenItemCount = children.length - visibleItemCount;
  const canExpand = showOverflowCount !== false && hasOverflow;

  useLayoutEffect(() => {
    if (!canExpand) {
      setIsOpen(false);
    }
  }, [canExpand]);

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
          onFocusCapture?.(event);
        }}
        onBlurCapture={(event) => {
          setHasFocus(event.currentTarget.contains(event.relatedTarget));
          onBlurCapture?.(event);
        }}
      >
        <div ref={itemsRef} className={styles.items}>
          {children.slice(0, inlineItemCount).map((child, index) => {
            const isHidden = index >= visibleItemCount;

            return (
              <div
                key={child.key ?? index}
                className={styles.item}
                data-hidden={isHidden || undefined}
                data-last-visible={index === visibleItemCount - 1 || undefined}
                aria-hidden={isHidden || undefined}
                inert={isHidden}
              >
                {child}
              </div>
            );
          })}
        </div>
        {canExpand && (
          <Popover.Trigger
            ref={triggerRef}
            type="button"
            className={styles.trigger}
            data-visible={isCountVisible || undefined}
            aria-label={overflowLabel}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            onKeyUp={(event) => event.stopPropagation()}
          >
            +{hiddenItemCount}
          </Popover.Trigger>
        )}
        <Popover.Popup
          anchor={containerRef}
          align="start"
          sideOffset={-9}
          alignOffset={-7}
          aria-label={overflowLabel}
          className={styles.popup}
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          onKeyUp={(event) => event.stopPropagation()}
        >
          {children}
        </Popover.Popup>
      </div>
    </Popover.Root>
  );
};
