import { type ComponentProps } from 'react';
import { type Banner } from '../src/primitives/feedback/Banner/Banner';

export const BANNER_PROP_DESCRIPTIONS = {
  children: 'Caller-provided content, including text, links and controls.',
  status:
    'Feedback meaning: neutral, info, success, warning or error. Defaults to info. Does not assign a role or live region.',
  variant:
    'Solid or soft appearance. Defaults to solid, independently of status.',
  color:
    'Palette override: gray, blue, green, orange or red. When omitted, status selects the corresponding palette.',
  icon: 'Optional leading ReactNode. The caller supplies decorative or accessible icon semantics.',
  action:
    'Optional trailing ReactNode. Banner.Action supplies a small outline action that inherits the resolved banner color; arbitrary controls are also accepted.',
  className: 'Class merged onto the root div or composed element.',
  style: 'Inline styles applied to the root div or composed element.',
  ref: 'Ref to the root div, or to the DOM element supplied through render.',
  render:
    'Base UI element or render callback. The callback receives native props/ref and resolved status, variant and color state.',
} satisfies Partial<Record<keyof ComponentProps<typeof Banner>, string>>;
