import { css } from '@linaria/core';

import {
  color,
  fontFamily,
  FONT_WEIGHT,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

// The static label chip on partner cards: a bordered, uppercase mono tag for
// regions, languages, and categories.
export const partnerChipClassName = css`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(4)};
  color: ${color('black-80')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.04em;
  line-height: ${fontSize(4)};
  padding: ${spacing(1)} ${spacing(2.5)};
  text-transform: uppercase;
`;
