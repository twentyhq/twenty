import { type CardFooterProps } from '../src/primitives/surfaces/Card/types/CardFooterProps';

export const CARD_FOOTER_PROP_DESCRIPTIONS = {
  children: 'Footer content, such as actions or supporting text.',
  divider: 'Shows the top border unless explicitly set to false.',
  className: 'CSS class merged with the part class.',
  style: 'Native styles applied to the rendered part.',
  ref: 'Ref to the default div, or the element supplied through render.',
  render:
    'Element or render callback composed through Base UI useRender. Supply native button or link attributes on the rendered owner.',
} satisfies Partial<Record<keyof CardFooterProps, string>>;
