import { JsonList } from '@ui/json-visualizer/components/internal/JsonList';
import { JsonNode } from '@ui/json-visualizer/components/JsonNode';
import { JsonTreeContextProvider } from '@ui/json-visualizer/components/JsonTreeContextProvider';
import { JsonValue } from 'type-fest';

export const JsonTree = ({
  value,
  shouldHighlightNode,
  emptyArrayLabel,
  emptyObjectLabel,
  arrowButtonCollapsedLabel,
  arrowButtonExpandedLabel,
}: {
  value: JsonValue;
  shouldHighlightNode?: (keyPath: string) => boolean;
  emptyArrayLabel: string;
  emptyObjectLabel: string;
  arrowButtonCollapsedLabel: string;
  arrowButtonExpandedLabel: string;
}) => {
  return (
    <JsonTreeContextProvider
      value={{
        shouldHighlightNode,
        emptyArrayLabel,
        emptyObjectLabel,
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
