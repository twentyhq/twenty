import { JsonNestedNode } from '@ui/components/JsonTree/internal/JsonNestedNode';
import { useJsonTreeContextOrThrow } from '@ui/components/JsonTree/internal/hooks/useJsonTreeContextOrThrow';
import { type JsonNodeHighlighting } from '@ui/components/JsonTree/types/JsonNodeHighlighting';
import { IconCube } from '@ui/icon';
import { type JsonObject } from 'type-fest';

export const JsonObjectNode = ({
  label,
  value,
  depth,
  keyPath,
  highlighting,
}: {
  label?: string;
  value: JsonObject;
  depth: number;
  keyPath: string;
  highlighting: JsonNodeHighlighting | undefined;
}) => {
  const { emptyObjectLabel } = useJsonTreeContextOrThrow();

  return (
    <JsonNestedNode
      elements={Object.entries(value).map(([key, value]) => ({
        id: key,
        label: key,
        value,
      }))}
      renderElementsCount={(count) => `{${count}}`}
      label={label}
      Icon={IconCube}
      depth={depth}
      emptyElementsText={emptyObjectLabel}
      keyPath={keyPath}
      highlighting={highlighting}
    />
  );
};
