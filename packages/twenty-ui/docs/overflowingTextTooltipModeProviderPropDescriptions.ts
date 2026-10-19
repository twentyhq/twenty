import { type ComponentProps } from 'react';

import { type OverflowingTextTooltipModeProvider } from '../src/primitives/typography/OverflowingTextWithTooltip/OverflowingTextTooltipModeProvider';

export const OVERFLOWING_TEXT_TOOLTIP_MODE_PROVIDER_PROP_DESCRIPTIONS = {
  children: 'Content whose OverflowingTextWithTooltip instances use the mode.',
  mode: '`measure-on-hover` checks truncation on pointer entry and focus. `measure-on-open` checks it when the tooltip tries to open. `disabled` renders only the text.',
} satisfies Partial<
  Record<
    keyof ComponentProps<typeof OverflowingTextTooltipModeProvider>,
    string
  >
>;
