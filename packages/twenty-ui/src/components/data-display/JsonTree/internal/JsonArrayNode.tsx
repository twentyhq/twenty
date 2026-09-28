import { JsonNestedNode } from '@ui/components/data-display/JsonTree/internal/JsonNestedNode';
import { useJsonTreeContextOrThrow } from '@ui/components/data-display/JsonTree/internal/hooks/useJsonTreeContextOrThrow';
import { type JsonNodeHighlighting } from '@ui/components/data-display/JsonTree/types/JsonNodeHighlighting';
import { IconBrackets } from '@ui/icon';
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
