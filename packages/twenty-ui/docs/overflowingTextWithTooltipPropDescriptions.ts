import { type OverflowingTextWithTooltipProps } from '../src/primitives/typography/OverflowingTextWithTooltip/types/OverflowingTextWithTooltipProps';

export const OVERFLOWING_TEXT_WITH_TOOLTIP_PROP_DESCRIPTIONS = {
  text: 'Caller-owned text or React content. Non-string content requires `tooltipContent`. URLs stay plain text.',
  tooltipContent:
    'Plain text displayed in the tooltip. Defaults to nonempty string `text`.',
  truncate:
    'Single-line ellipsis by default. Set false to wrap. Cannot be combined with `lineClamp`.',
  lineClamp:
    'Positive integer limiting visible lines, matching Text. Cannot be combined with `truncate`.',
  render:
    'Replaces the default div. Native props, styles, handlers and ref target the displayed text, not the popup.',
  isTooltipMultiline: 'Preserves whitespace and line breaks in the tooltip.',
  tooltipDelay: 'Hover delay in milliseconds.',
  tooltipPlace: 'Preferred side of the tooltip.',
  alwaysShowTooltip: 'Allows the tooltip even when the text is not truncated.',
  isFocusable:
    'Adds an optional tab stop. Native tabIndex and focusable render elements also open the tooltip on focus.',
} satisfies Partial<Record<keyof OverflowingTextWithTooltipProps, string>>;
