import { css } from '@emotion/react';

import { type ThemeType } from '..';

export const TEXT_INPUT_STYLE = (props: { theme: ThemeType }) => css`
  background-color: transparent;
  border: none;
  color: ${props.theme.font.color.primary};
  font-family: ${props.theme.font.family};
  font-size: inherit;
  font-weight: inherit;
  outline: none;
  padding: ${props.theme.spacing(0)} ${props.theme.spacing(2)};

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${props.theme.font.color.light};
    font-family: ${props.theme.font.family};
    font-weight: ${props.theme.font.weight.medium};
  }
`;
