import { type ComponentProps } from 'react';
import { type InlineBanner } from '../src/components/feedback/InlineBanner/InlineBanner';

export const INLINE_BANNER_PROP_DESCRIPTIONS = {
  children:
    'Caller-provided content. Standard plain strings truncate with a focusable tooltip; rich nodes render directly. Compact content wraps.',
  status:
    'Feedback meaning: neutral, info, success, warning or error. Defaults to info. Roles and announcements remain caller-owned.',
  variant:
    'Solid or soft appearance, independently of status and layout. Defaults to soft.',
  color:
    'Gray, blue, green, orange or red palette override. An omitted color follows status.',
  layout:
    'Standard full-width layout or compact wrapping layout with a 512px maximum content width. Defaults to standard.',
  embedded:
    'Removes the standard bottom margin. Compact layouts have no bottom margin.',
  icon: 'Leading ReactNode. Defaults to a decorative information icon. Pass null to omit it.',
  action:
    'Optional trailing ReactNode. Compose Button, links or multiple controls with their complete public APIs.',
  className: 'Class merged onto the root div or composed element.',
  style: 'Inline styles applied to the root div or composed element.',
  ref: 'Ref to the root div, or to the DOM element supplied through render.',
  render:
    'Base UI root element or render callback, receiving native props/ref and resolved Banner state.',
} satisfies Partial<Record<keyof ComponentProps<typeof InlineBanner>, string>>;
