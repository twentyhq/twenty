import { createContext } from 'react';

export const SliderControlRegistrationContext = createContext<
  ((control: HTMLDivElement | null) => void) | undefined
>(undefined);
