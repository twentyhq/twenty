import { type ChipProps } from '../src/primitives/data-display/Chip/types/ChipProps';

export const CHIP_PROP_DESCRIPTIONS = {
  children:
    'Caller-owned content. Missing or empty children add no fallback label.',
  size: 'Visual size of the chip.',
  variant:
    'Background and border treatment. Outline has a strong border, lighter resting fill and 8px inline padding. Plain has no resting fill or leading padding. Both use ghost hover and pressed feedback when clickable.',
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
  maxWidth:
    'Maximum rendered chip width in pixels, including its leading and trailing padding and any outline border.',
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
