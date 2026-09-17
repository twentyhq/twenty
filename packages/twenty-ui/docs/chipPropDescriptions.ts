import { type ChipProps } from '../src/primitives/data-display/Chip/types/ChipProps';

export const CHIP_PROP_DESCRIPTIONS = {
  size: 'Visual size of the chip.',
  variant: 'Background treatment of the chip.',
  color: 'Primary or secondary text color.',
  shape: 'Square or round corners.',
  weight: 'Font weight of the label.',
  disabled:
    'Applies disabled styling and disables activation when `onClick` is supplied.',
  clickable:
    'Enables hover and pointer styling. Defaults to whether `onClick` is supplied; does not add button semantics by itself.',
  nativeButton:
    'Set to `false` when a clickable chip uses `render` with an element other than a native button.',
  startElement: 'Content before the label, such as an avatar or icon.',
  endElement:
    'Content after the label. Avoid interactive content when the chip itself is a button.',
  endElementDivider:
    'Adds a divider before `endElement` when that slot has content.',
  maxWidth:
    'Maximum chip width in pixels, used to constrain and truncate the label.',
  tooltipLabel:
    'Tooltip content for a string label. Defaults to the label text.',
  tooltipPlace: 'Position of the string-label tooltip.',
  alwaysShowTooltip:
    'Shows the string-label tooltip even when the label is not truncated.',
  isLabelHidden:
    'Hides the label while keeping the start and end elements. Supply an accessible name for an interactive chip.',
  forceEmptyText:
    'Suppresses the empty label when children are missing, empty, or false.',
  emptyLabel:
    'Placeholder shown when children are missing, empty, or false, unless `forceEmptyText` is enabled.',
} satisfies Partial<Record<keyof ChipProps, string>>;
