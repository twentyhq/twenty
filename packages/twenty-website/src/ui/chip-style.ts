import { css } from '@linaria/core';

import {
  color,
  fontFamily,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';

// The shared look of a selectable chip — single-select (typeOfTeam) and
// multi-select (languages) both use it: a bordered pill that fills blue when
// selected.
export const chipClassName = css`
  ${typeRampDeclarations('bodySm')}
  background: none;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  cursor: pointer;
  font-family: ${fontFamily('sans')};
  padding: ${spacing(1)} ${spacing(3)};

  &[data-selected] {
    background: ${color('blue')};
    border-color: ${color('blue')};
    color: ${color('white')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;
