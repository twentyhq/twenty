import { JsonList } from '@ui/json-visualizer/components/internal/JsonList';
import { JsonNode } from '@ui/json-visualizer/components/JsonNode';
import { JsonTreeContextProvider } from '@ui/json-visualizer/components/JsonTreeContextProvider';
import { type ShouldExpandNodeInitiallyProps } from '@ui/json-visualizer/contexts/JsonTreeContext';
import { type GetJsonNodeHighlighting } from '@ui/json-visualizer/types/GetJsonNodeHighlighting';
import { ThemeContext } from '@ui/theme';
import { useContext } from 'react';
import { type JsonValue } from 'type-fest';

export const JsonTree = ({
  value,
  getNodeHighlighting,
  shouldExpandNodeInitially,
  emptyArrayLabel,
  emptyObjectLabel,
  emptyStringLabel,
  arrowButtonCollapsedLabel,
  arrowButtonExpandedLabel,
  onNodeValueClick,
}: {
  value: JsonValue;
  getNodeHighlighting?: GetJsonNodeHighlighting;
  shouldExpandNodeInitially: (
    params: ShouldExpandNodeInitiallyProps,
  ) => boolean;
  emptyArrayLabel: string;
  emptyObjectLabel: string;
  emptyStringLabel: string;
  arrowButtonCollapsedLabel: string;
  arrowButtonExpandedLabel: string;
  onNodeValueClick?: (valueAsString: string) => void;
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <JsonTreeContextProvider
      value={{
        getNodeHighlighting,
        shouldExpandNodeInitially,
        emptyArrayLabel,
        emptyObjectLabel,
        emptyStringLabel,
        arrowButtonCollapsedLabel,
        arrowButtonExpandedLabel,
        onNodeValueClick,
      }}
    >
      <JsonList depth={0} theme={theme}>
        <JsonNode value={value} depth={0} keyPath="" />
      </JsonList>
    </JsonTreeContextProvider>
  );
};
