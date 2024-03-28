import { ThemeType } from 'src/theme/types/ThemeType';

import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}
