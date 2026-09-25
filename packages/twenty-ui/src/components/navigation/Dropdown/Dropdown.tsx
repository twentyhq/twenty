import { type ReactElement } from 'react';

import { DropdownActionItem } from './internal/DropdownActionItem';
import { DropdownBack } from './internal/DropdownBack';
import { DropdownContent } from './internal/DropdownContent';
import { DropdownEmpty } from './internal/DropdownEmpty';
import { DropdownHeader } from './internal/DropdownHeader';
import { DropdownLoading } from './internal/DropdownLoading';
import { DropdownOptionItem } from './internal/DropdownOptionItem';
import { DropdownPage } from './internal/DropdownPage';
import { DropdownRoot as InternalDropdownRoot } from './internal/DropdownRoot';
import { DropdownSearch } from './internal/DropdownSearch';
import { DropdownSection } from './internal/DropdownSection';
import { DropdownSeparator } from './internal/DropdownSeparator';
import { DropdownSubmenu } from './internal/DropdownSubmenu';
import { DropdownSubmenuTrigger } from './internal/DropdownSubmenuTrigger';
import { DropdownTrigger } from './internal/DropdownTrigger';
import { type DropdownRootProps } from './types/DropdownRootProps';

const DropdownRoot: (props: DropdownRootProps) => ReactElement =
  InternalDropdownRoot;

export const Dropdown = {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  ActionItem: DropdownActionItem,
  OptionItem: DropdownOptionItem,
  Search: DropdownSearch,
  Header: DropdownHeader,
  Page: DropdownPage,
  Back: DropdownBack,
  Submenu: DropdownSubmenu,
  SubmenuTrigger: DropdownSubmenuTrigger,
  Section: DropdownSection,
  Separator: DropdownSeparator,
  Loading: DropdownLoading,
  Empty: DropdownEmpty,
};
