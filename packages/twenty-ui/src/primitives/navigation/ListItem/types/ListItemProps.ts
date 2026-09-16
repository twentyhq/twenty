import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type ListItemColor } from './ListItemColor';
import { type ListItemDescriptionPlacement } from './ListItemDescriptionPlacement';
import { type ListItemIndicator } from './ListItemIndicator';
import { type ListItemState } from './ListItemState';

export type ListItemProps = Omit<
  useRender.ComponentProps<'div', ListItemState>,
  'color'
> & {
  /** Color of the text and icons. `danger` marks a destructive action. */
  color?: ListItemColor;
  /**
   * Whether the item is selected. Shows the check or checkbox indicator when
   * `indicator` is set.
   */
  selected?: boolean;
  /** Applies the highlighted style, for example to the focused item of a list. */
  focused?: boolean;
  /** Prevents clicks and applies the disabled style. */
  disabled?: boolean;
  /**
   * Selection indicator: a check icon after the content or a checkbox before
   * it.
   */
  indicator?: ListItemIndicator;
  /** Icon rendered before the content. */
  startIcon?: ReactNode;
  /** Icon rendered after the content. */
  endIcon?: ReactNode;
  /** Supporting text, placed according to `descriptionPlacement`. */
  description?: ReactNode;
  /**
   * Where the description renders: inline after the content or at the end of
   * the row.
   */
  descriptionPlacement?: ListItemDescriptionPlacement;
  /** Trailing content, such as buttons, rendered after the content. */
  actions?: ReactNode;
  /**
   * Keyboard shortcut keys displayed at the end of the row. Registering the
   * shortcut is up to the application.
   */
  hotkeys?: string[];
  /** Shows a chevron indicating that the item opens a submenu. */
  hasSubmenu?: boolean;
};
