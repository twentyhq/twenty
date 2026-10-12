import { createContext } from 'react';

import { type TextDirection } from './TextDirection';

export const TextDirectionContext = createContext<TextDirection | undefined>(
  undefined,
);
