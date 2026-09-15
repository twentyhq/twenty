import { isBoolean } from '@sniptt/guards';
import { type ReactNode } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

export const isRenderableSlot = (slot: ReactNode) =>
  isDefined(slot) && !isBoolean(slot) && slot !== '';
