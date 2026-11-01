import { type ComponentProps } from 'react';

import { type NumberField } from '../src/primitives/input/NumberField/NumberField';

const NUMBER_FIELD_COMMON_PROP_DESCRIPTIONS = {
  className:
    'Class applied to this part, or a callback receiving its NumberField state.',
  style:
    'Inline styles applied to this part, or a callback receiving its NumberField state.',
  render:
    'Composes this part with an element or render callback. Forward the supplied props and ref to the corresponding DOM element.',
};

export const NUMBER_FIELD_PART_PROP_DESCRIPTIONS = {
  Root: {
    ...NUMBER_FIELD_COMMON_PROP_DESCRIPTIONS,
    children: 'Composed NumberField parts and supporting content.',
    ref: 'Ref to the root div, or the element composed through Root.render.',
    inputRef:
      'Ref to the hidden native number input used for submission and validation. Use Input.ref to focus the visible text input.',
    id: 'ID associated with the visible input. Generated when omitted.',
    value: 'Controlled raw numeric value. Use null for an empty field.',
    defaultValue:
      'Initial uncontrolled number. Omit to start empty; the public type accepts a number.',
    locale:
      'Locale or locale list used to format and parse numbers. Defaults to the runtime locale.',
    format:
      'Intl.NumberFormat options for display and parsing, including currency, units, percent, grouping, and precision. Explicit rounding options can normalize the committed value on blur.',
    onValueChange:
      'Receives the next number or null and change details with the native event, reason, cancellation and propagation methods, and optional stepping direction.',
    onValueCommitted:
      'Receives the committed number or null and generic details containing event and reason. Typing commits on blur; pointer steps and scrubbing commit on release; keyboard and wheel changes commit immediately.',
    min: 'Inclusive minimum for stepping and native range validation.',
    max: 'Inclusive maximum for stepping and native range validation.',
    allowOutOfRange:
      'Allows typed, pasted, and autofilled values outside min and max. Native range validation still applies; step interactions remain bounded.',
    step: 'Base amount for buttons, arrow keys, wheel, and scrubbing. Use any to disable native step validation while stepping by 1.',
    smallStep: 'Amount used while Alt is held. Defaults to 0.1.',
    largeStep: 'Amount used while Shift is held. Defaults to 10.',
    snapOnStep:
      'Snaps step interactions to multiples of the active step. Defaults to false.',
    allowWheelScrub:
      'Allows wheel adjustments while the visible input is focused and hovered. Defaults to false.',
    name: 'Name of the raw numeric value submitted by the hidden input.',
    form: 'ID of the form owning the hidden native number input.',
    required: 'Requires a numeric value for native form submission.',
    disabled:
      'Prevents interaction and excludes the value from form submission.',
    readOnly: 'Prevents changes while keeping the visible input focusable.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof NumberField.Root>, string>
  >,
  Group: {
    ...NUMBER_FIELD_COMMON_PROP_DESCRIPTIONS,
    children: 'The visible input and any increment or decrement controls.',
    ref: 'Ref to the group div, or the element composed through Group.render.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof NumberField.Group>, string>
  >,
  Input: {
    ...NUMBER_FIELD_COMMON_PROP_DESCRIPTIONS,
    ref: 'Ref to the visible native text input.',
    render:
      'Composes the visible text input with an element or render callback. Forward the supplied props and ref to an input. Customize layout through Root or Group.',
    'aria-roledescription':
      'Describes the role to assistive technology. Defaults to Number field; use Field.Label, aria-label, or aria-labelledby for the accessible name.',
    size: 'Native input size attribute. Use styles to customize visual dimensions.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof NumberField.Input>, string>
  >,
  Decrement: {
    ...NUMBER_FIELD_COMMON_PROP_DESCRIPTIONS,
    children:
      'Visible content for the decrement control. Supply its accessible name.',
    ref: 'Ref to the decrement button, or the element composed through render.',
    nativeButton:
      'Whether render composes a native button. Set false for a custom non-button element so Base UI supplies button interaction.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof NumberField.Decrement>, string>
  >,
  Increment: {
    ...NUMBER_FIELD_COMMON_PROP_DESCRIPTIONS,
    children:
      'Visible content for the increment control. Supply its accessible name.',
    ref: 'Ref to the increment button, or the element composed through render.',
    nativeButton:
      'Whether render composes a native button. Set false for a custom non-button element so Base UI supplies button interaction.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof NumberField.Increment>, string>
  >,
  ScrubArea: {
    ...NUMBER_FIELD_COMMON_PROP_DESCRIPTIONS,
    children:
      'Content the user can drag to adjust the number, plus an optional ScrubAreaCursor.',
    ref: 'Ref to the scrub area span, or the element composed through render.',
    direction: 'Pointer movement direction used for scrubbing.',
    pixelSensitivity:
      'Pixels of pointer movement needed for a step. Larger values reduce sensitivity.',
    teleportDistance:
      'Optional distance from the scrub area center at which the pointer loops around.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof NumberField.ScrubArea>, string>
  >,
  ScrubAreaCursor: {
    ...NUMBER_FIELD_COMMON_PROP_DESCRIPTIONS,
    children:
      'Custom cursor content shown during supported pointer-lock scrubbing.',
    ref: 'Ref to the cursor span portaled to the document body while active. Null while absent.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof NumberField.ScrubAreaCursor>, string>
  >,
};
