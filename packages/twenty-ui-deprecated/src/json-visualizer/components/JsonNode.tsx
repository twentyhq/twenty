import {
  isBoolean,
  isNonEmptyString,
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
import { isDefined } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';

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
  const { getNodeHighlighting, emptyStringLabel } = useJsonTreeContextOrThrow();

  const highlighting = getNodeHighlighting?.(keyPath);

  if (!isDefined(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString="null"
        Icon={IconCircleOff}
        highlighting={highlighting}
      />
    );
  }

  if (isString(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString={isNonEmptyString(value) ? value : emptyStringLabel}
        Icon={IconTypography}
        highlighting={highlighting}
      />
    );
  }

  if (isNumber(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString={String(value)}
        Icon={IconNumber9}
        highlighting={highlighting}
      />
    );
  }

  if (isBoolean(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString={String(value)}
        Icon={IconCheckbox}
        highlighting={highlighting}
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
        highlighting={highlighting}
      />
    );
  }

  return (
    <JsonObjectNode
      label={label}
      value={value}
      depth={depth}
      keyPath={keyPath}
      highlighting={highlighting}
    />
  );
};
