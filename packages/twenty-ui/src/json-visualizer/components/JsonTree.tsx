import { JsonList } from '@ui/json-visualizer/components/internal/JsonList';
import { JsonNode } from '@ui/json-visualizer/components/JsonNode';
import { JsonValue } from 'type-fest';

export const JsonTree = ({ value }: { value: JsonValue }) => {
  return (
    <JsonList depth={0}>
      <JsonNode value={value} depth={0} keyPath="" />
    </JsonList>
  );
};
