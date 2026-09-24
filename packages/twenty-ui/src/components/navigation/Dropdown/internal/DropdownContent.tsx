import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { isFunction } from '@sniptt/guards';
import { useRef } from 'react';

import { Popover } from '@ui/primitives/surfaces/Popover/Popover';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { type DropdownContentProps } from '../types/DropdownContentProps';
import { DropdownPageFocusEffect } from './DropdownPageFocusEffect';
import { getDropdownFocusTarget } from './getDropdownFocusTarget';
import { isUnhandledModifierShortcut } from './isUnhandledModifierShortcut';
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
  const contentRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(contentRef, ref);
  const handleNavigation = useDropdownKeyboardNavigation({
    type,
    isSubmenu,
    setOpen,
  });

  return (
    <>
      <Popover.Popup
        {...props}
        ref={mergedRef}
        side={side ?? (isSubmenu ? 'inline-end' : 'bottom')}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        anchor={anchor}
        container={container}
        keepMounted={keepMounted}
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
          (() => {
            if (!focusOnOpen) {
              return false;
            }

            if (!isDefined(contentRef.current)) {
              return true;
            }

            return getDropdownFocusTarget({
              content: contentRef.current,
              edge: initialFocusEdge,
              type,
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
      </Popover.Popup>
      <DropdownPageFocusEffect contentRef={contentRef} />
    </>
  );
};
