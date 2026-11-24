import { createContext } from 'react';

import { type EmojiPickerRootProps } from '../types/EmojiPickerRootProps';

export const EmojiPickerContext = createContext<
  Required<Omit<EmojiPickerRootProps, 'children'>> | undefined
>(undefined);
