export const TOOLTIP_PART_PROP_DESCRIPTIONS = {
  Root: {
    children:
      'Parts or a render function receiving the active trigger payload. Root renders no DOM node.',
    handle: 'Connects detached triggers and imperative open/close actions.',
    onOpenChange:
      'Receives the requested open state and unchanged Base UI event details, including reason, event, trigger and cancel().',
  },
  Trigger: {
    ref: 'Ref to the rendered trigger element, a button by default.',
    disabled:
      'Disables tooltip interaction for this trigger without disabling its native element.',
    render:
      'Composes a native element or a component that forwards attributes, handlers and ref.',
  },
  Portal: {
    container:
      'Portal destination. Defaults to the current theme container, then the document body.',
    ref: 'Ref to the portal div.',
  },
  Positioner: {
    ref: 'Ref to the positioning div. Native props, styles and render target this element.',
    sideOffset:
      'Distance from the anchor. Defaults to 0 in compound usage. Accepts a number or positioning function.',
    side: 'Preferred physical or logical side of the anchor. Defaults to top.',
  },
  Popup: {
    children:
      'Content rendered as supplied. Does not create a portal, positioner, title layout or arrow.',
    ref: 'Ref to the popup div. Native props, styles and render target this element.',
    withExitAnimation: 'Enables the optional Twenty exit transition.',
  },
  Arrow: {
    ref: 'Ref to the arrow div. Compose inside Popup.',
  },
  Viewport: {
    ref: 'Ref to the content-transition div. Useful when several triggers share changing content.',
  },
  Provider: {
    children:
      'Tooltips sharing delay, closeDelay and timeout configuration. Provider renders no DOM node.',
  },
};
