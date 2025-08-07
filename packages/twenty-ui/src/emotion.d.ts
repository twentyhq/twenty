import { type ThemeType } from './theme/types/ThemeType';

declare module '@emotion/react' {
   
  export interface Theme extends ThemeType {}
}
