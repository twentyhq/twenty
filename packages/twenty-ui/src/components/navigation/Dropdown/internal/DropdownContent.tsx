import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { isFunction } from '@sniptt/guards';
import { useMemo, useState } from 'react';

import { Popover } from '@ui/primitives/surfaces/Popover/Popover';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { type DropdownContentProps } from '../types/DropdownContentProps';
import { DropdownPageFocusEffect } from './DropdownPageFocusEffect';
import { DropdownRowOrderEffect } from './DropdownRowOrderEffect';
import { DropdownRowScopeContext } from './DropdownRowScopeContext';
import { DropdownRowsEffect } from './DropdownRowsEffect';
import { getDropdownFocusTarget } from './getDropdownFocusTarget';
import { getDropdownSearch } from './getDropdownSearch';
import { getDropdownTabStopRowId } from './getDropdownTabStopRowId';
import { isRovingDropdownRow } from './isRovingDropdownRow';
import { isUnhandledModifierShortcut } from './isUnhandledModifierShortcut';
import { notifyDropdownRegistryListeners } from './notifyDropdownRegistryListeners';
import { useDropdownContext } from './useDropdownContext';
import { useDropdownKeyboardNavigation } from './useDropdownKeyboardNavigation';

export const DropdownContent = ({
  side,
  align = 'start',
  sideOffset = 0,
  alignOffset,
  anchor,
  collisionPadding,
  container,
  keepMounted,
  width = 200,
  className,
  style,
  children,
  initialFocus,
  onKeyDown,
  onFocus,
  onInput,
  onClick,
  onMouseDown,
  onPointerDown,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ref,
  ...props
}: DropdownContentProps) => {
  const {
    type,
    isSubmenu,
    pageId,
    registry,
    contentRef,
    focusedRowId,
    setFocusedRowId,
    initialFocusEdge,
    focusOnOpen,
    triggerId,
    titleId,
  } = useDropdownContext();
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const [rowIds, setRowIds] = useState<string[]>();
  const mergedRef = useMergedRefs(contentRef, ref, setContent);
  const handleNavigation = useDropdownKeyboardNavigation();
  const tabStopRowId = getDropdownTabStopRowId({ rowIds, focusedRowId });
  const rowScope = useMemo(
    () => ({ registry, rowIds, tabStopRowId }),
    [registry, rowIds, tabStopRowId],
  );
  const defaultAriaLabelledBy = isDefined(ariaLabel)
    ? undefined
    : (titleId ?? triggerId);

  return (
    <>
      <Popover.Portal container={container} keepMounted={keepMounted}>
        <Popover.Positioner
          side={side ?? (isSubmenu ? 'inline-end' : 'bottom')}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          anchor={anchor}
          collisionPadding={collisionPadding}
        >
          <Popover.Popup
            {...props}
            ref={mergedRef}
            role={type === 'menu' ? 'menu' : 'dialog'}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy ?? defaultAriaLabelledBy}
            data-dropdown-content=""
            className={mergeClassNames(styles.content, className)}
            style={(state) => ({
              width,
              ...(isFunction(style) ? style(state) : style),
            })}
            initialFocus={
              initialFocus ??
              (() => {
                if (!focusOnOpen) {
                  return false;
                }

                if (!isDefined(contentRef.current)) {
                  return true;
                }

                return getDropdownFocusTarget({
                  content: contentRef.current,
                  registry,
                  pageId,
                  type,
                  edge: initialFocusEdge,
                });
              })
            }
            onKeyDown={(event) => {
              onKeyDown?.(event);
              handleNavigation(event);

              if (!isUnhandledModifierShortcut(event)) {
                event.stopPropagation();
              }
            }}
            onFocus={(event) => {
              onFocus?.(event);

              const row = Array.from(registry.rows).find(
                (registration) =>
                  registration.elementRef.current === event.target,
              );

              if (
                isDefined(row) &&
                isRovingDropdownRow({
                  row,
                  search: getDropdownSearch(registry),
                })
              ) {
                setFocusedRowId(row.id);
              }
            }}
            onInput={(event) => {
              onInput?.(event);
              notifyDropdownRegistryListeners(registry);
            }}
            onClick={(event) => {
              event.stopPropagation();
              onClick?.(event);
            }}
            onMouseDown={(event) => {
              event.stopPropagation();
              onMouseDown?.(event);
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
              onPointerDown?.(event);
            }}
          >
            <DropdownRowScopeContext.Provider value={rowScope}>
              {children}
            </DropdownRowScopeContext.Provider>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
      <DropdownPageFocusEffect />
      <DropdownRowsEffect content={content} setRowIds={setRowIds} />
      <DropdownRowOrderEffect content={content} />
    </>
  );
};
