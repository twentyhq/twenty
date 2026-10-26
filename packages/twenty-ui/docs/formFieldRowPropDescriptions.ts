import { type ComponentProps } from 'react';

import { type FormFieldRow } from '../src/components/input/FormFieldRow/FormFieldRow';

export const FORM_FIELD_ROW_PROP_DESCRIPTIONS = {
  label:
    'Optional visible field label and default group name. Supply aria-label or aria-labelledby when the label is omitted. Label each nested input separately.',
  startIcon:
    'Optional decorative icon before the label. The caller controls icon dimensions.',
  trailing:
    'Optional trailing content. Nested controls retain their own keyboard focus and event behavior.',
  trailingProps:
    'Native props, event handlers and ref applied to the trailing content wrapper. The wrapper is rendered only when trailing content is present; className is merged with the shared layout class.',
  children:
    'Field content, such as plain inputs, recipient chips, selectors or toggles. The caller owns input labels, state and click-to-focus behavior.',
  onClick:
    'Native group click handler. Providing a handler shows a pointer cursor; the caller guards nested-control and portaled events as needed.',
  labelWidth:
    'Preferred label column width, capped at 40% of the row. Numbers use pixels; use the same width for aligned sibling rows.',
  contentPaddingInline:
    'Inline padding around the field content, defaulting to 8 pixels. Numbers use pixels; CSS padding values are also supported. Set 0 to align content with the row inset when no visible label is present.',
  isHoverable:
    'Enables a neutral hover background independently of click handlers. Keyboard focus remains on nested controls without changing the row background.',
  hasDivider:
    'Shows a decorative bottom divider. Set false on the final row when the surrounding surface supplies its own border.',
  className: 'CSS class applied to the group root.',
  style: 'Inline styles applied to the group root.',
  ref: 'Ref forwarded to the group root div.',
  render: 'Customizes the group root. Forward its props and ref.',
} satisfies Partial<Record<keyof ComponentProps<typeof FormFieldRow>, string>>;
