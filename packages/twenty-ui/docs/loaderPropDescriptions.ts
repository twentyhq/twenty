import { type LoaderProps } from '../src/primitives/feedback/Loader/types/LoaderProps';

export const LOADER_PROP_DESCRIPTIONS = {
  color:
    'Theme color for the animated dot and border. When omitted, inherits the button color if available, otherwise the tertiary text color.',
  className: 'CSS class merged with the loader container class.',
  style:
    'Native styles merged with the loader color defaults. Explicit styles win.',
  ref: 'Ref to the container div, or the element supplied through render.',
  render: 'Element or render callback composed through Base UI useRender.',
  role: 'Supply status to expose loading feedback as a live region. No role is assigned by default.',
  'aria-label': 'Accessible name for a labeled loader status.',
  'aria-labelledby': 'ID of text that names the loader status.',
  'aria-hidden':
    'Hide a decorative loader when another element supplies loading feedback.',
} satisfies Partial<Record<keyof LoaderProps, string>>;
