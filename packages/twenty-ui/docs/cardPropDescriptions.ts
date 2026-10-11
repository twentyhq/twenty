import { type CardRootProps } from '../src/primitives/surfaces/Card/types/CardRootProps';

export const CARD_PROP_DESCRIPTIONS = {
  children: 'Card sections or other content.',
  fullWidth: 'Sets the card width to 100% of its container.',
  rounded: 'Cards already use the same rounded corners when omitted.',
  backgroundColor:
    'CSS background color of the outer card. Child sections have their own backgrounds.',
  className: 'CSS class merged with the part class.',
  style: 'Native styles applied to the rendered part.',
  ref: 'Ref to the default div, or the element supplied through render.',
  render:
    'Element or render callback composed through Base UI useRender. Supply native button or link attributes on the rendered owner.',
} satisfies Partial<Record<keyof CardRootProps, string>>;
