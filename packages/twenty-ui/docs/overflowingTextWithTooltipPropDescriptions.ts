import { type ComponentProps } from 'react';

import { type OverflowingTextWithTooltip } from '../src/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';

export const OVERFLOWING_TEXT_WITH_TOOLTIP_PROP_DESCRIPTIONS = {
  text: 'Text or React content to truncate. Non-string React content requires `tooltipContent`.',
  tooltipContent:
    'Plain text displayed in the tooltip. Defaults to `text` when it is a nonempty string.',
  size: 'Small inherited text sizing or the large fixed-height treatment.',
  isTooltipMultiline: 'Preserves whitespace and line breaks in the tooltip.',
  displayedMaxRows:
    'Maximum displayed rows. Omit for single-line truncation; use a positive integer for multiline text.',
  tooltipDelay: 'Hover delay in milliseconds.',
  tooltipPlace: 'Preferred side of the tooltip.',
  alwaysShowTooltip: 'Allows the tooltip even when the text is not truncated.',
  isFocusable: 'Adds a tab stop and opens the tooltip on focus or click.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof OverflowingTextWithTooltip>, string>
>;
