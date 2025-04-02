import { JsonList } from '@ui/json-visualizer/components/internal/JsonList';
import { JsonNode } from '@ui/json-visualizer/components/JsonNode';
import { JsonTreeContextProvider } from '@ui/json-visualizer/components/JsonTreeContextProvider';
import { ShouldExpandNodeInitiallyProps } from '@ui/json-visualizer/contexts/JsonTreeContext';
import { GetJsonNodeHighlighting } from '@ui/json-visualizer/types/GetJsonNodeHighlighting';
import { JsonValue } from 'type-fest';

export const JsonTree = ({
  value,
  getNodeHightlighting,
  shouldExpandNodeInitially,
  emptyArrayLabel,
  emptyObjectLabel,
  emptyStringLabel,
  arrowButtonCollapsedLabel,
  arrowButtonExpandedLabel,
}: {
  value: JsonValue;
  getNodeHightlighting?: GetJsonNodeHighlighting;
  shouldExpandNodeInitially: (
    params: ShouldExpandNodeInitiallyProps,
  ) => boolean;
  emptyArrayLabel: string;
  emptyObjectLabel: string;
  emptyStringLabel: string;
  arrowButtonCollapsedLabel: string;
  arrowButtonExpandedLabel: string;
}) => {
  return (
    <JsonTreeContextProvider
      value={{
        getNodeHightlighting,
        shouldExpandNodeInitially,
        emptyArrayLabel,
        emptyObjectLabel,
        emptyStringLabel,
        arrowButtonCollapsedLabel,
        arrowButtonExpandedLabel,
      }}
    >
      <JsonList depth={0}>
        <JsonNode value={value} depth={0} keyPath="" />
      </JsonList>
    </JsonTreeContextProvider>
  );
};
