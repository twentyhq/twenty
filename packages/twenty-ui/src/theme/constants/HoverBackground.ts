import { type ThemeType } from '..';

export const HOVER_BACKGROUND = (props: { theme: ThemeType }) => `
  transition: background 0.1s ease;
  &:hover {
    background: ${props.theme.background.transparent.light};
  }
`;
