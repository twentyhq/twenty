export const TOOLTIP_PROP_DESCRIPTIONS = {
  children:
    'A single trigger element. Custom components must forward their ref, native attributes, and event handlers.',
  content: 'Supplementary content displayed in the tooltip.',
  delay: 'Delay in milliseconds before opening on hover. Defaults to 600.',
  closeDelay:
    'Delay in milliseconds before closing after hover ends. Defaults to 0.',
  side: 'Preferred side of the trigger. Defaults to top and may change to avoid collisions.',
  align: 'Alignment relative to the trigger. Defaults to center.',
  sideOffset: 'Distance from the trigger in pixels. Defaults to 10.',
  alignOffset: 'Offset along the alignment axis in pixels.',
  arrow: 'Displays an arrow pointing to the trigger. Defaults to false.',
  maxWidth: 'Maximum popup width. Defaults to 300 pixels.',
  positionMethod: 'CSS positioning method for the popup.',
  open: 'Controlled visibility of the tooltip.',
  defaultOpen: 'Initial visibility when the tooltip manages its own state.',
  onOpenChange: 'Called when an interaction requests a visibility change.',
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
