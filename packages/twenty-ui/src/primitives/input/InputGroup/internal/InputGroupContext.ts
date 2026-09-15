import { createContext } from 'react';

import { type InputSize } from '@ui/primitives/input/types/InputSize';

export const InputGroupContext = createContext<{ size: InputSize } | null>(
  null,
);
