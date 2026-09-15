import { isBoolean } from '@sniptt/guards';
import { type ReactNode } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

export const isRenderableAdornment = (adornment: ReactNode) =>
  isDefined(adornment) && !isBoolean(adornment) && adornment !== '';
