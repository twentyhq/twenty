export const SELECT_PART_PROP_DESCRIPTIONS = {
  Root: {
    children:
      'Select parts sharing selection, open state and accessible relationships. Root renders no DOM node.',
    onValueChange:
      'Receives the requested generic value and unchanged Base UI event details, including reason, event and cancel(). Multiple selection receives an array; a cleared single value is null.',
    onOpenChange:
      'Receives the requested open state and unchanged Base UI event details.',
    inputRef: 'Ref to the native hidden input used for form submission.',
  },
  Trigger: {
    children:
      'Trigger content rendered as supplied. Compose Value and Icon explicitly.',
    ref: 'Ref to the rendered trigger element, a button by default.',
    size: 'Visual size of the trigger. Defaults to md.',
  },
  Portal: {
    container:
      'Portal destination. Defaults to the current theme container, then the document body. Explicit null waits for a container before mounting.',
    ref: 'Ref to the portal div. Native props and render apply to this element.',
  },
  Positioner: {
    ref: 'Ref to the positioning div. Native props, styles and render apply to this element.',
    alignItemWithTrigger:
      'Uses the upstream selected-item alignment by default. Set false to use side, align and offsets without overlapping the trigger.',
  },
  Popup: {
    children:
      'Popup content rendered as supplied. Compose inside Positioner and choose Portal separately.',
    ref: 'Ref to the popup div. Native props, styles and render apply to this element.',
  },
  Item: {
    children:
      'Option content rendered as supplied. Compose ItemText and an optional ItemIndicator explicitly.',
    ref: 'Ref to the rendered option element. Native props and render apply to this element.',
  },
  Icon: {
    children:
      'Trigger icon content. Defaults to the Twenty chevron; explicit children replace it.',
  },
  ItemIndicator: {
    children:
      'Selected indicator content. Defaults to the Twenty check icon; explicit children replace it.',
  },
};
