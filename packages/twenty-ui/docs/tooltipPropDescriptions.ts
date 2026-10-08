export const TOOLTIP_PROP_DESCRIPTIONS = {
  children:
    'A single trigger element. Custom components must forward their ref, native attributes, and event handlers.',
  content:
    'Supplementary content, or a function receiving the active trigger payload. Strings and numbers use the shorthand title layout.',
  description: 'Optional secondary text below the shorthand title.',
  startIcon: 'Optional node before the shorthand title.',
  handle: 'Connects detached triggers and preserves their typed payloads.',
  triggerProps:
    'Full Trigger props, including native props, ref, render and payload. Overrides the shorthand trigger defaults.',
  positionerProps:
    'Full Positioner props, including native props, ref and render. Overrides shorthand placement and width defaults.',
  portalProps:
    'Full Portal props, including native props, ref and render. Overrides shorthand portal defaults.',
  arrowPadding: 'Minimum distance from the arrow to the popup edges.',
  delay: 'Delay in milliseconds before opening on hover. Defaults to 600.',
  closeDelay:
    'Delay in milliseconds before closing after hover ends. Defaults to 0.',
  side: 'Preferred side of the trigger. Defaults to top and may change to avoid collisions.',
  align: 'Alignment relative to the trigger. Defaults to center.',
  sideOffset: 'Distance from the trigger in pixels. Defaults to 10.',
  alignOffset: 'Offset along the alignment axis in pixels.',
  arrow: 'Displays an arrow pointing to the trigger. Defaults to false.',
  withExitAnimation:
    'Fades and slides the popup out when it closes instead of hiding it at once.',
  maxWidth: 'Maximum popup width. Defaults to 300 pixels.',
  positionMethod: 'CSS positioning method for the popup.',
  open: 'Controlled visibility of the tooltip.',
  defaultOpen: 'Initial visibility when the tooltip manages its own state.',
  onOpenChange:
    'Receives the requested open state and unchanged Base UI event details, including reason, event, trigger and cancel().',
  disabled: 'Prevents the tooltip from opening.',
  disableHoverablePopup:
    'Prevents hovering over the popup from keeping it open.',
  className: 'Additional CSS class for the popup.',
  style: 'Inline styles for the popup.',
  ref: 'Ref forwarded to the popup element.',
  container: 'Portal destination. Defaults to the current theme container.',
  keepMounted: 'Keeps the popup mounted while closed.',
  anchor: 'An explicit positioning anchor for the popup.',
};
