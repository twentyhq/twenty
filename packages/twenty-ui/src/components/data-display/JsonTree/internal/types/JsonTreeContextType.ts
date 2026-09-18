import { type GetJsonNodeHighlighting } from '../../types/GetJsonNodeHighlighting';
import { type ShouldExpandNodeInitiallyProps } from '../../types/ShouldExpandNodeInitiallyProps';

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
