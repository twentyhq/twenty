import { type GetJsonNodeHighlighting } from '@ui/primitives/json-visualizer/types/GetJsonNodeHighlighting';
import { createContext } from 'react';

export type ShouldExpandNodeInitiallyProps = { keyPath: string; depth: number };

export type JsonTreeContextType = {
  getNodeHighlighting?: GetJsonNodeHighlighting;
  shouldExpandNodeInitially: (
    params: ShouldExpandNodeInitiallyProps,
  ) => boolean;
  emptyStringLabel: string;
  emptyArrayLabel: string;
  emptyObjectLabel: string;
  arrowButtonCollapsedLabel: string;
  arrowButtonExpandedLabel: string;
  onNodeValueClick?: (valueAsString: string) => void;
};

export const JsonTreeContext = createContext<JsonTreeContextType | undefined>(
  undefined,
);
