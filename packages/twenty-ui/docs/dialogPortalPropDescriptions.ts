import { type DialogPortalProps } from '../src/primitives/surfaces/Dialog/types/DialogPortalProps';

export const DIALOG_PORTAL_PROP_DESCRIPTIONS = {
  container:
    'Portal destination. Omit to use the nearest theme scope, then the parent portal or document body. Explicit null defers mounting; an element, ShadowRoot or ref keeps Base UI resolution.',
  keepMounted: 'Keeps the portal and its content mounted while closed.',
  ref: 'Ref to the portal div, or the element supplied through render.',
  render: 'Composes the portal element. Native props and handlers target it.',
} satisfies Partial<Record<keyof DialogPortalProps, string>>;
