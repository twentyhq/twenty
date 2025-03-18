import { createContext } from 'react';

export type JsonTreeContextType = {
  shouldHighlightNode?: (keyPath: string) => boolean;
  shouldExpandNodeInitially: (keyPath: string, depth: number) => boolean;
  emptyStringLabel: string;
  emptyArrayLabel: string;
  emptyObjectLabel: string;
  arrowButtonCollapsedLabel: string;
  arrowButtonExpandedLabel: string;
};

export const JsonTreeContext = createContext<JsonTreeContextType | undefined>(
  undefined,
);
