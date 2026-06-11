import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import { IconCheck } from '@ui/display';
import { type MenuItemAccent } from '../../types/MenuItemAccent';

import styles from './StyledMenuItemBase.module.scss';

export type MenuItemBaseProps = {
  accent?: MenuItemAccent;
  isKeySelected?: boolean;
  isHoverBackgroundDisabled?: boolean;
  hovered?: boolean;
  disabled?: boolean;
  focused?: boolean;
};

// The deprecated Linaria styled components forwarded refs and arbitrary
// native props, so the ports preserve that contract.
type StyledMenuItemBaseElementProps = MenuItemBaseProps &
  ComponentPropsWithoutRef<'div'>;

export const StyledMenuItemBase = forwardRef<
  HTMLDivElement,
  StyledMenuItemBaseElementProps
>(
  (
    {
      accent,
      isKeySelected,
      isHoverBackgroundDisabled,
      hovered: _hovered,
      disabled,
      focused,
      className,
      children,
      ...rest
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={clsx(styles.menuItemBase, className)}
      data-accent={accent}
      data-key-selected={isKeySelected || undefined}
      data-hover-background-disabled={isHoverBackgroundDisabled || undefined}
      data-disabled={disabled || undefined}
      data-focused={focused || undefined}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </div>
  ),
);

StyledMenuItemBase.displayName = 'StyledMenuItemBase';

type StyledStaticDivProps = ComponentPropsWithoutRef<'div'>;

const createStyledDiv = (classNameFromModule: string, displayName: string) => {
  const StyledDiv = forwardRef<HTMLDivElement, StyledStaticDivProps>(
    ({ className, children, ...rest }, ref) => (
      <div
        ref={ref}
        className={clsx(classNameFromModule, className)}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...rest}
      >
        {children}
      </div>
    ),
  );

  StyledDiv.displayName = displayName;

  return StyledDiv;
};

export const StyledMenuItemLabel = createStyledDiv(
  styles.menuItemLabel,
  'StyledMenuItemLabel',
);

export const StyledMenuItemLabelLight = createStyledDiv(
  styles.menuItemLabelLight,
  'StyledMenuItemLabelLight',
);

export const StyledNoIconFiller = createStyledDiv(
  styles.noIconFiller,
  'StyledNoIconFiller',
);

export const StyledMenuItemLeftContent = createStyledDiv(
  styles.menuItemLeftContent,
  'StyledMenuItemLeftContent',
);

export const StyledMenuItemRightContent = createStyledDiv(
  styles.menuItemRightContent,
  'StyledMenuItemRightContent',
);

export const StyledDraggableItem = createStyledDiv(
  styles.draggableItem,
  'StyledDraggableItem',
);

type HoverableMenuItemBaseProps = {
  isIconDisplayedOnHoverOnly?: boolean;
  cursor?: 'drag' | 'default';
} & MenuItemBaseProps;

type StyledHoverableMenuItemBaseElementProps = HoverableMenuItemBaseProps &
  ComponentPropsWithoutRef<'div'>;

export const StyledHoverableMenuItemBase = forwardRef<
  HTMLDivElement,
  StyledHoverableMenuItemBaseElementProps
>(
  (
    {
      accent,
      isKeySelected,
      isHoverBackgroundDisabled,
      hovered: _hovered,
      disabled,
      focused,
      isIconDisplayedOnHoverOnly,
      cursor,
      className,
      children,
      ...rest
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={clsx(styles.hoverableMenuItemBase, className)}
      data-accent={accent}
      data-key-selected={isKeySelected || undefined}
      data-hover-background-disabled={isHoverBackgroundDisabled || undefined}
      data-disabled={disabled || undefined}
      data-focused={focused || undefined}
      data-icon-displayed-on-hover-only={
        isIconDisplayedOnHoverOnly || undefined
      }
      data-cursor={cursor}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </div>
  ),
);

StyledHoverableMenuItemBase.displayName = 'StyledHoverableMenuItemBase';

export const StyledMenuItemIconCheck = ({ size }: { size?: number }) => (
  <div className={styles.menuItemIconCheckContainer}>
    <IconCheck size={size} />
  </div>
);

export const StyledMenuItemContextualText = createStyledDiv(
  styles.menuItemContextualText,
  'StyledMenuItemContextualText',
);

export const StyledRightMenuItemContextualText = createStyledDiv(
  styles.rightMenuItemContextualText,
  'StyledRightMenuItemContextualText',
);
