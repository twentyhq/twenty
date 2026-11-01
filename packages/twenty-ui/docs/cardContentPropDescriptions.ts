import { type CardContentProps } from '../src/primitives/surfaces/Card/types/CardContentProps';

export const CARD_CONTENT_PROP_DESCRIPTIONS = {
  children: 'Content displayed in the padded body.',
  divider: 'Adds a bottom border.',
  className: 'CSS class merged with the part class.',
  style: 'Native styles applied to the rendered part.',
  ref: 'Ref to the default div, or the element supplied through render.',
  render:
    'Element or render callback composed through Base UI useRender. Supply native button or link attributes on the rendered owner.',
} satisfies Partial<Record<keyof CardContentProps, string>>;
