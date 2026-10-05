import { type ComponentPropsWithRef } from 'react';

import { type DropdownActionItemProps } from '../src/components/navigation/Dropdown/types/DropdownActionItemProps';
import { type DropdownCloseProps } from '../src/components/navigation/Dropdown/types/DropdownCloseProps';
import { type DropdownContentProps } from '../src/components/navigation/Dropdown/types/DropdownContentProps';
import { type DropdownOptionItemProps } from '../src/components/navigation/Dropdown/types/DropdownOptionItemProps';
import { type DropdownPageProps } from '../src/components/navigation/Dropdown/types/DropdownPageProps';
import { type DropdownRootProps } from '../src/components/navigation/Dropdown/types/DropdownRootProps';
import { type DropdownSearchProps } from '../src/components/navigation/Dropdown/types/DropdownSearchProps';
import { type DropdownSectionProps } from '../src/components/navigation/Dropdown/types/DropdownSectionProps';
import { type DropdownSubmenuTriggerProps } from '../src/components/navigation/Dropdown/types/DropdownSubmenuTriggerProps';

const DROPDOWN_ROOT_PROP_DESCRIPTIONS = {
  type: 'Interaction model: `menu` for commands and links, `picker` for search and selectable options, or `panel` for forms. It sets the ARIA roles, initial focus, and keyboard navigation.',
  open: 'Whether the popup is open. Use with `onOpenChange` to control it.',
  defaultOpen: 'Whether the popup is initially open when uncontrolled.',
  onOpenChange:
    'Called with the next open state when the popup opens or closes.',
  onEscapeKeyDown:
    'Called when Escape is about to close the popup. Call `event.preventDefault()` to keep it open.',
  onInteractOutside:
    'Called when a press outside the popup, or Tab out of it, is about to close it. `event.target` is the element pressed outside, or `null` after Tab. Call `event.preventDefault()` to keep it open.',
  multiple:
    'Allows selecting several options. Options then keep the popup open and show a checkbox by default.',
  defaultPage:
    'ID of the `Page` shown when the popup opens. Closing the popup resets the page history to it. Defaults to `root`.',
} satisfies Partial<Record<keyof DropdownRootProps, string>>;

const DROPDOWN_ITEM_PROP_DESCRIPTIONS = {
  actions:
    'Trailing controls rendered beside the primary row control. Only supported in picker and panel pages, since a menu may only contain menu items. Secondary actions activate independently of the row.',
  actionsVisibility:
    'Whether trailing actions appear on hover or remain visible. Defaults to `hover`.',
  shortcutJoinLabel:
    'Text between sequential shortcut steps. Defaults to `then`.',
  className: 'CSS class applied to the row.',
  style: 'Inline styles applied to the row.',
  render:
    'Element rendered as the row instead of a native button. Custom components must forward the supplied props and ref.',
} satisfies Partial<Record<keyof DropdownActionItemProps, string>>;

export const DROPDOWN_PART_PROP_DESCRIPTIONS = {
  Root: DROPDOWN_ROOT_PROP_DESCRIPTIONS,
  Content: {
    width: 'CSS width of the popup. Numbers are in pixels.',
  } satisfies Partial<Record<keyof DropdownContentProps, string>>,
  ActionItem: {
    ...DROPDOWN_ITEM_PROP_DESCRIPTIONS,
    closeOnClick:
      'Closes the dropdown after activation, along with parent menus when inside a submenu. Ignored when `page` is set.',
    page: 'ID of the `Page` to show on activation. The popup stays open, and the row shows a chevron by default.',
  } satisfies Partial<Record<keyof DropdownActionItemProps, string>>,
  OptionItem: {
    ...DROPDOWN_ITEM_PROP_DESCRIPTIONS,
    selected:
      'Whether the option is selected. Exposed as `aria-checked` in menus and `aria-pressed` in other dropdown types, or as `aria-current` when `render` is not a button, such as a link. Omit it for options that navigate or apply without a selection state.',
    onSelect:
      'Called when the option is activated. The application owns the selected value.',
    closeOnSelect:
      'Closes the dropdown after selection. Defaults to `true`, or `false` when `multiple` is set.',
    indicator:
      'Selection indicator: a check icon after the content, a checkbox before it, or none. Defaults to `checkbox` when `multiple` is set, otherwise `check`, and to `none` when `selected` is omitted.',
  } satisfies Partial<Record<keyof DropdownOptionItemProps, string>>,
  Search: {
    onValueChange:
      'Called with the search text on every change. The application filters the results.',
  } satisfies Partial<Record<keyof DropdownSearchProps, string>>,
  Close: {
    'aria-label':
      'Accessible name of the close control. Required because the default control only shows an icon.',
  } satisfies Partial<Record<keyof DropdownCloseProps, string>>,
  Page: {
    id: 'Identifier matched by `defaultPage`, the `page` prop of actions, and `goToPage`. The page renders only while it is current.',
    type: 'Interaction model while the page is shown. Defaults to the root `type`.',
  } satisfies Partial<Record<keyof DropdownPageProps, string>>,
  Back: DROPDOWN_ITEM_PROP_DESCRIPTIONS,
  Submenu: DROPDOWN_ROOT_PROP_DESCRIPTIONS,
  SubmenuTrigger: {
    ...DROPDOWN_ITEM_PROP_DESCRIPTIONS,
    openOnHover: 'Also opens the submenu when the row is hovered.',
    delay:
      'Delay in milliseconds before the submenu opens on hover. Requires `openOnHover`. Defaults to `300`.',
    closeDelay:
      'Delay in milliseconds before a submenu opened on hover closes. Requires `openOnHover`. Defaults to `0`.',
  } satisfies Partial<Record<keyof DropdownSubmenuTriggerProps, string>>,
  Section: {
    columns:
      'Number of grid columns. Sets the grid layout and enables horizontal arrow navigation and vertical movement by row.',
    label:
      'Heading displayed above the rows. It also names the group for assistive technologies.',
    scrollable:
      'Caps the section height and scrolls its rows. Nest labelled sections inside it to scroll them as one list.',
  } satisfies Partial<Record<keyof DropdownSectionProps, string>>,
  Separator: {
    className:
      'Class applied to the separator. Native div attributes and refs are also accepted.',
  } satisfies Partial<Record<keyof ComponentPropsWithRef<'div'>, string>>,
  Loading: {
    children: 'Loading message announced as a polite, busy status.',
    className:
      'Class applied to the status. Native div attributes and refs are also accepted.',
  } satisfies Partial<Record<keyof ComponentPropsWithRef<'div'>, string>>,
  Empty: {
    children: 'Empty-state message announced as a polite status.',
    className:
      'Class applied to the status. Native div attributes and refs are also accepted.',
  } satisfies Partial<Record<keyof ComponentPropsWithRef<'div'>, string>>,
};
