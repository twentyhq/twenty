import { type ComponentProps } from 'react';

import { type Toast } from '../src/components/feedback/Toast/Toast';

export const TOAST_PROP_DESCRIPTIONS = {
  children: 'Main message node. Callers own its content and accessible text.',
  status:
    'Feedback meaning: neutral, info, success, warning, or error. Defaults to neutral and selects the icon and theme palette.',
  description: 'Optional supporting content node rendered below the message.',
  icon: 'Leading icon node. Defaults to the status icon. Pass null to omit it.',
  iconLabel:
    'Accessible name of the default icon. Without it, the icon is decorative.',
  action: 'Optional footer node, such as a Button with a caller-owned action.',
  progress:
    'Completion percentage. Providing it disables the countdown. Removing it starts a fresh duration.',
  duration:
    'Milliseconds before onClose is called, defaulting to 6000. Zero keeps the toast open. Changes restart the countdown; live updateToast duration patches restart it even when unchanged. Hover and keyboard focus pause it until both leave.',
  onCancel:
    'Called when the cancel button is clicked. Providing it and renderable cancelLabel content shows the button.',
  onClose:
    'For standalone Toast, called once per mount by the close button or expiry. For provider notifications, called once on close, expiry, closeToast, or limit eviction, after dismissal and before exit cleanup. Provider teardown does not call it.',
  cancelLabel:
    'Cancel button content node. Defaults to Cancel. Pass null to hide the control.',
  closeLabel: 'Accessible name of the close button. Defaults to Close.',
  className: 'Additional class names merged onto the root.',
  style: 'Inline styles forwarded to the root.',
  ref: 'Ref to the root div, or the element supplied through render.',
  render:
    'Element or callback composition for the root. Native props and the ref target the rendered element.',
} satisfies Partial<Record<keyof ComponentProps<typeof Toast>, string>>;
