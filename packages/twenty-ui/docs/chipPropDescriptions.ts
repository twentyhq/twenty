import { type ChipProps } from '../src/primitives/data-display/Chip/types/ChipProps';

export const CHIP_PROP_DESCRIPTIONS = {
  children:
    'Caller-owned content. Missing or empty children add no fallback label.',
  size: 'Visual size of the chip.',
  variant: 'Background treatment of the chip.',
  color: 'Primary or secondary text color.',
  shape: 'Square or round corners.',
  weight: 'Font weight of the content.',
  clickable:
    'Enables hover and pointer styling. Defaults to whether `onClick` is supplied; does not change the default div or add keyboard behavior.',
  startElement: 'Content before the label, such as an avatar or icon.',
  endElement:
    'Content after the label. Avoid interactive content when the chip itself is a button or link.',
  endElementDivider:
    'Adds a divider before `endElement` when that slot has content.',
  maxWidth: 'Maximum chip width in pixels, used to constrain the content.',
  truncate: 'Truncates overflowing content with an ellipsis. Defaults to true.',
  tooltipContent:
    'Tooltip text. Defaults to string children. Supply text explicitly for node content.',
  tooltipPlace: 'Position of the content tooltip.',
  tooltipDelay: 'Delay in milliseconds before the tooltip opens.',
  isTooltipMultiline: 'Preserves line breaks in the tooltip text.',
  alwaysShowTooltip:
    'Shows the content tooltip even when the content is not truncated.',
  render:
    'Replaces the default div. Compose a native button or link explicitly; that owner supplies disabled and native interaction behavior.',
} satisfies Partial<Record<keyof ChipProps, string>>;
