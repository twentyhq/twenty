import { css } from '@linaria/core';

import {
  color,
  fontFamily,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';

// The shared look of a typed control (text input, textarea, the number field):
// a bordered field on the scheme surface that turns blue on focus and red when
// its aria-invalid flag is set. Border is lineStrong, placeholder is inkSubtle.
export const fieldControlClassName = css`
  ${typeRampDeclarations('bodySm')}
  background: none;
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(2)};
  box-sizing: border-box;
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  height: clamp(40px, 5.5vh, 56px);
  padding: ${spacing(1)} ${spacing(3)};
  width: 100%;

  &::placeholder {
    color: ${semanticColor.inkSubtle};
  }

  &:focus-visible {
    border-color: ${color('blue')};
    outline: none;
  }

  &[aria-invalid='true'] {
    border-color: ${color('error')};
  }
`;
