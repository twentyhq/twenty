import { type IconButtonWithTooltipProps } from '../src/components/IconButtonWithTooltip/types/IconButtonWithTooltipProps';
import { ICON_BUTTON_PROP_DESCRIPTIONS } from './iconButtonPropDescriptions';

export const ICON_BUTTON_WITH_TOOLTIP_PROP_DESCRIPTIONS = {
  ...ICON_BUTTON_PROP_DESCRIPTIONS,
  tooltipContent: 'Text displayed when hovering or focusing the button.',
  tooltipPlace: 'Preferred placement of the tooltip relative to the button.',
  tooltipDelay: 'Delay before showing the tooltip.',
  tooltipOffset: 'Distance in pixels between the button and the tooltip.',
} satisfies Partial<Record<keyof IconButtonWithTooltipProps, string>>;
