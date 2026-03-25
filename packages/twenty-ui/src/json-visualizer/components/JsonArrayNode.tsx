import { IconBrackets } from '@ui/display';
import { JsonNestedNode } from '@ui/json-visualizer/components/JsonNestedNode';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';
import { type JsonArray } from 'type-fest';

export const JsonArrayNode = ({
  label,
  value,
  depth,
  keyPath,
  highlighting,
}: {
  label?: string;
  value: JsonArray;
  depth: number;
  keyPath: string;
  highlighting: JsonNodeHighlighting | undefined;
}) => {
  const { emptyArrayLabel } = useJsonTreeContextOrThrow();

  return (
    <JsonNestedNode
      elements={[...value.entries()].map(([key, value]) => ({
        id: key,
        label: String(key),
        value,
      }))}
      renderElementsCount={(count) => `[${count}]`}
      label={label}
      Icon={IconBrackets}
      depth={depth}
      emptyElementsText={emptyArrayLabel}
      keyPath={keyPath}
      highlighting={highlighting}
    />
  );
};
