import { DirectionProvider } from '@base-ui/react/direction-provider';
import { type ReactNode } from 'react';

type TextDirectionProviderProps = {
  direction: 'ltr' | 'rtl';
  children: ReactNode;
};

// Components here read their direction from Base UI, so the provider that sets
// it belongs here too: consumers reach it through twenty-ui the way they reach
// icons through twenty-ui/icon, rather than taking on Base UI themselves.
export const TextDirectionProvider = ({
  direction,
  children,
}: TextDirectionProviderProps) => (
  <DirectionProvider direction={direction}>{children}</DirectionProvider>
);
