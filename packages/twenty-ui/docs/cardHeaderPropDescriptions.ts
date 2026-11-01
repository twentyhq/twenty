import { type CardHeaderProps } from '../src/primitives/surfaces/Card/types/CardHeaderProps';

export const CARD_HEADER_PROP_DESCRIPTIONS = {
  children:
    'Header content. Supply a Heading when the title should be a semantic heading.',
  className: 'CSS class merged with the part class.',
  style: 'Native styles applied to the rendered part.',
  ref: 'Ref to the default div, or the element supplied through render.',
  render:
    'Element or render callback composed through Base UI useRender. Supply native button or link attributes on the rendered owner.',
} satisfies Partial<Record<keyof CardHeaderProps, string>>;
