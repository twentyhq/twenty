import { type ListItemProps } from '../src/primitives/navigation/ListItem/types/ListItemProps';

export const LIST_ITEM_PROP_DESCRIPTIONS = {
  actionsVisibility:
    'Shows actions on hover or focus by default. Use always to keep actions visible on every input device.',
  submenuOpen:
    'Rotates the submenu indicator when the host expands the row. The host owns the expansion state and semantics.',
} satisfies Partial<Record<keyof ListItemProps, string>>;
