import { css } from '@linaria/core';

import { theme } from '@/theme';

export const chipBaseStyles = css`
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(4)};
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.04em;
  line-height: ${theme.lineHeight(4)};
  padding: ${theme.spacing(1)} ${theme.spacing(2.5)};
  text-transform: uppercase;
`;
