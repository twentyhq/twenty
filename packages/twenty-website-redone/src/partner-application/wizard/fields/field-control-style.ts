import { css } from '@linaria/core';

import {
  color,
  fontFamily,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';

// The shared look of a typed control (text input, textarea, the combobox
// input): a bordered field on the scheme surface that turns blue on focus and
// red when its aria-invalid flag is set.
export const fieldControlClassName = css`
  ${typeRampDeclarations('bodySm')}
  background: none;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  padding: ${spacing(2.5)} ${spacing(3)};
  width: 100%;

  &::placeholder {
    color: ${semanticColor.inkMuted};
  }

  &:focus-visible {
    border-color: ${color('blue')};
    outline: none;
  }

  &[aria-invalid='true'] {
    border-color: ${color('error')};
  }
`;
