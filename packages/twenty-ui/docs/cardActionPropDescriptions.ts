import { type CardActionProps } from '../src/primitives/surfaces/Card/types/CardActionProps';

export const CARD_ACTION_PROP_DESCRIPTIONS = {
  children:
    'Optional content inside the stretched action. Supply an accessible name for empty actions.',
  disabled:
    'Disables native button owners and suppresses the action hover treatment. Links and associated controls remain responsible for their own disabled behavior.',
  className: 'CSS class merged with the action class.',
  style: 'Native styles applied to the rendered action.',
  ref: 'Ref to the default button, or the element supplied through render.',
  render:
    'Native element or render callback composed through Base UI useRender. Links retain native navigation and labels activate their associated controls without an additional keyboard target.',
} satisfies Partial<Record<keyof CardActionProps, string>>;
