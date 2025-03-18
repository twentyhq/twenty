import {
  isBoolean,
  isNonEmptyString,
  isNull,
  isNumber,
  isString,
} from '@sniptt/guards';
import {
  IconCheckbox,
  IconCircleOff,
  IconNumber9,
  IconTypography,
} from '@ui/display';
import { JsonArrayNode } from '@ui/json-visualizer/components/JsonArrayNode';
import { JsonObjectNode } from '@ui/json-visualizer/components/JsonObjectNode';
import { JsonValueNode } from '@ui/json-visualizer/components/JsonValueNode';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { isArray } from '@ui/json-visualizer/utils/isArray';
import { JsonValue } from 'type-fest';

export const JsonNode = ({
  label,
  value,
  depth,
  keyPath,
}: {
  label?: string;
  value: JsonValue;
  depth: number;
  keyPath: string;
}) => {
  const { shouldHighlightNode, emptyStringLabel } = useJsonTreeContextOrThrow();

  const isHighlighted = shouldHighlightNode?.(keyPath) ?? false;

  if (isNull(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString="null"
        Icon={IconCircleOff}
        isHighlighted={isHighlighted}
      />
    );
  }

  if (isString(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString={isNonEmptyString(value) ? value : emptyStringLabel}
        Icon={IconTypography}
        isHighlighted={isHighlighted}
      />
    );
  }

  if (isNumber(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString={String(value)}
        Icon={IconNumber9}
        isHighlighted={isHighlighted}
      />
    );
  }

  if (isBoolean(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString={String(value)}
        Icon={IconCheckbox}
        isHighlighted={isHighlighted}
      />
    );
  }

  if (isArray(value)) {
    return (
      <JsonArrayNode
        label={label}
        value={value}
        depth={depth}
        keyPath={keyPath}
      />
    );
  }

  return (
    <JsonObjectNode
      label={label}
      value={value}
      depth={depth}
      keyPath={keyPath}
    />
  );
};
