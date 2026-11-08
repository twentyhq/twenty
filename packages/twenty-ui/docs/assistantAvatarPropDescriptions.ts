import { type AssistantAvatarProps } from '../src/components/data-display/AssistantAvatar/types/AssistantAvatarProps';

export const ASSISTANT_AVATAR_PROP_DESCRIPTIONS = {
  shape: 'Body shape of the assistant character.',
  color:
    'Theme palette used for the body and face. Follows the surrounding light or dark theme.',
  face: 'Expression displayed over the body.',
  size: 'Width and height in pixels: 14, 16, 20, 24, or 40.',
  isAnimated:
    "Plays the selected expression's idle loop. Displays the static expression when the browser prefers reduced motion.",
  'aria-label':
    'Accessible name for a standalone character. Adds the image role; omit it beside a visible name.',
  'aria-labelledby':
    'ID of an element naming a standalone character. Adds the image role.',
  'aria-hidden':
    'Explicitly hides or exposes the character. Takes precedence over the name-based default.',
  className: 'CSS class applied to the span root.',
  style:
    'Inline styles applied to the root. Explicit styles override its dimensions and palette defaults.',
} satisfies Partial<Record<keyof AssistantAvatarProps, string>>;
