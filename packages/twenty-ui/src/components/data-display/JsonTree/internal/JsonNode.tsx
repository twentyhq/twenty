import {
  isBoolean,
  isNonEmptyString,
  isNumber,
  isString,
} from '@sniptt/guards';
import { JsonArrayNode } from '@ui/components/data-display/JsonTree/internal/JsonArrayNode';
import { JsonObjectNode } from '@ui/components/data-display/JsonTree/internal/JsonObjectNode';
import { JsonValueNode } from '@ui/components/data-display/JsonTree/internal/JsonValueNode';
import { useJsonTreeContextOrThrow } from '@ui/components/data-display/JsonTree/internal/hooks/useJsonTreeContextOrThrow';
import { isArray } from '@ui/components/data-display/JsonTree/internal/utils/isArray';
import {
  IconCheckbox,
  IconCircleOff,
  IconNumber9,
  IconTypography,
} from '@ui/icon';
import { isDefined } from '@ui/utilities/utils/isDefined';
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
