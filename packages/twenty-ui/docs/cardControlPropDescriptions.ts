import { type CardControlProps } from '../src/primitives/surfaces/Card/types/CardControlProps';

export const CARD_CONTROL_PROP_DESCRIPTIONS = {
  children:
    'Independent controls or tooltip targets lifted above a sibling Card.Action.',
  className: 'CSS class merged with the control class.',
  style: 'Native styles applied to the rendered control wrapper.',
  ref: 'Ref to the default span, or the element supplied through render.',
  render:
    'Element or render callback composed through Base UI useRender. The supplied control retains its native attributes, events and semantics.',
} satisfies Partial<Record<keyof CardControlProps, string>>;
