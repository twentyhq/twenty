import { TOOLTIP_PROP_DESCRIPTIONS } from './tooltipPropDescriptions';

export const TOOLTIP_PART_PROP_DESCRIPTIONS = {
  Popup: {
    ...TOOLTIP_PROP_DESCRIPTIONS,
    children: 'Content displayed inside the popup.',
  },
  Content: {
    children: 'Primary text displayed in the tooltip.',
    description: 'Secondary explanation beneath the primary text.',
    startIcon: 'An icon displayed before the text.',
  },
};
