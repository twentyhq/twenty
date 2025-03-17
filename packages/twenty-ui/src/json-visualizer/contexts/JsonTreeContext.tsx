import { createContext } from 'react';

export type JsonTreeContextType = {
  shouldHighlightNode?: (keyPath: string) => boolean;
  emptyArrayLabel: string;
  emptyObjectLabel: string;
  arrowButtonCollapsedLabel: string;
  arrowButtonExpandedLabel: string;
};

export const JsonTreeContext = createContext<JsonTreeContextType | undefined>(
  undefined,
);
