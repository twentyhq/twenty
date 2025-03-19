import { createContext } from 'react';

export type ShouldExpandNodeInitiallyProps = { keyPath: string; depth: number };

export type JsonTreeContextType = {
  shouldHighlightNode?: (keyPath: string) => boolean;
  shouldExpandNodeInitially: (
    params: ShouldExpandNodeInitiallyProps,
  ) => boolean;
  emptyStringLabel: string;
  emptyArrayLabel: string;
  emptyObjectLabel: string;
  arrowButtonCollapsedLabel: string;
  arrowButtonExpandedLabel: string;
};

export const JsonTreeContext = createContext<JsonTreeContextType | undefined>(
  undefined,
);
