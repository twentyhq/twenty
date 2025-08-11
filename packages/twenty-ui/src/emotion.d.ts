import { type ThemeType } from './theme';

declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}
