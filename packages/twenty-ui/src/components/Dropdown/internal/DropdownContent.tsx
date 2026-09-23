import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { isFunction } from '@sniptt/guards';
import { useRef } from 'react';

import { useThemeContainer } from '@ui/theme-constants';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { type DropdownContentProps } from '../types/DropdownContentProps';
import { DropdownPageFocusEffect } from './DropdownPageFocusEffect';
import { getDropdownFocusTarget } from './getDropdownFocusTarget';
import { useDropdownContext } from './useDropdownContext';
import { useDropdownKeyboardNavigation } from './useDropdownKeyboardNavigation';

export const DropdownContent = ({
  side,
  align = 'start',
  sideOffset = 0,
  alignOffset,
  anchor,
  container,
  keepMounted,
  width = 200,
  className,
  style,
  children,
  initialFocus,
  onKeyDown,
  onClick,
  onMouseDown,
  onPointerDown,
  ref,
  ...props
}: DropdownContentProps) => {
  const { type, isSubmenu, setOpen, initialFocusEdge, focusOnOpen } =
    useDropdownContext();
  const themeContainer = useThemeContainer();
  const contentRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(contentRef, ref);
  const handleNavigation = useDropdownKeyboardNavigation({
    type,
    isSubmenu,
    setOpen,
  });

  return (
    <>
      <PopoverPrimitive.Portal
        container={container ?? themeContainer ?? undefined}
        keepMounted={keepMounted}
      >
        <PopoverPrimitive.Positioner
          side={side ?? (isSubmenu ? 'inline-end' : 'bottom')}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          anchor={anchor}
          className={styles.positioner}
        >
          <PopoverPrimitive.Popup
            {...props}
            ref={mergedRef}
            role={type === 'menu' ? 'menu' : 'dialog'}
            data-dropdown-content=""
            data-type={type}
            className={mergeClassNames(styles.content, className)}
            style={(state) => ({
              width,
              ...(isFunction(style) ? style(state) : style),
            })}
            initialFocus={
              initialFocus ??
              (() =>
                !focusOnOpen
                  ? false
                  : isDefined(contentRef.current)
                    ? getDropdownFocusTarget({
                        content: contentRef.current,
                        edge: initialFocusEdge,
                        type,
                      })
                    : true)
            }
            onKeyDown={(event) => {
              event.stopPropagation();
              onKeyDown?.(event);
              handleNavigation(event);
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
            {children}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
      <DropdownPageFocusEffect contentRef={contentRef} />
    </>
  );
};
