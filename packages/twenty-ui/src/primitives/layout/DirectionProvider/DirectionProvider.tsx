import { DirectionProvider as DirectionProviderPrimitive } from '@base-ui/react/direction-provider';

import { TextDirectionContext } from './internal/TextDirectionContext';
import { type DirectionProviderProps } from './types/DirectionProviderProps';

export const DirectionProvider = ({
  direction = 'ltr',
  children,
}: DirectionProviderProps) => (
  <TextDirectionContext.Provider value={direction}>
    <DirectionProviderPrimitive direction={direction}>
      {children}
    </DirectionProviderPrimitive>
  </TextDirectionContext.Provider>
);
