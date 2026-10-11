export const POPOVER_PART_PROP_DESCRIPTIONS = {
  Root: {
    children:
      'Parts or a render function receiving the active trigger payload. Root renders no DOM element.',
    handle: 'Connects detached triggers and imperative open/close actions.',
    onOpenChange:
      'Receives the requested open state and Base UI event details, including reason, event, trigger, cancel() and preventUnmountOnClose().',
  },
  Portal: {
    container:
      'When omitted, uses the scoped theme container, then the Base UI parent portal or document body. Explicit null delays rendering until a target is supplied. Explicit elements, ShadowRoots and refs are forwarded unchanged; their DOM scope supplies CSS tokens.',
    ref: 'Ref to the portal div. Native props, handlers and render target this element.',
  },
  Positioner: {
    sideOffset:
      'Distance from the anchor. Defaults to 8. Accepts a number or positioning function.',
    ref: 'Ref to the positioning div. Accepts the complete Base UI anchor, collision and positioning contract.',
  },
  Popup: {
    children: 'Popup content. Compose Portal, Positioner and Arrow separately.',
    ref: 'Ref to the popup div. Focus props, native attributes, handlers and render target this element.',
  },
  Arrow: { ref: 'Ref to the arrow div. Compose inside Popup.' },
  Backdrop: { ref: 'Ref to the optional backdrop div. Compose inside Portal.' },
  Viewport: {
    ref: 'Ref to the content-transition div for changing trigger payloads.',
  },
};
