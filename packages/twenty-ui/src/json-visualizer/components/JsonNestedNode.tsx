import { Collapsible } from '@base-ui/react/collapsible';
import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useState } from 'react';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { type JsonValue } from 'type-fest';

import { type IconComponent } from '@ui/display';
import { JsonArrow } from '@ui/json-visualizer/components/internal/JsonArrow';
import { JsonNodeLabel } from '@ui/json-visualizer/components/internal/JsonNodeLabel';
import { JsonNodeValue } from '@ui/json-visualizer/components/internal/JsonNodeValue';
import { JsonNode } from '@ui/json-visualizer/components/JsonNode';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';

import styles from './JsonNestedNode.module.scss';

export const JsonNestedNode = ({
  label,
  Icon,
  elements,
  renderElementsCount,
  emptyElementsText,
  depth,
  keyPath,
  highlighting,
}: {
  label?: string;
  Icon: IconComponent;
  elements: Array<{ id: string | number; label: string; value: JsonValue }>;
  renderElementsCount?: (count: number) => string;
  emptyElementsText: string;
  depth: number;
  keyPath: string;
  highlighting?: JsonNodeHighlighting | undefined;
}) => {
  const { shouldExpandNodeInitially } = useJsonTreeContextOrThrow();

  const hideRoot = !isDefined(label);

  const [isOpen, setIsOpen] = useState(
    shouldExpandNodeInitially({ keyPath, depth }),
  );

  const renderedChildren = (
    <ul className={clsx(styles.list, depth > 0 && styles.nested)}>
      {elements.length === 0 ? (
        <JsonNodeValue valueAsString={emptyElementsText} />
      ) : (
        elements.map(({ id, label, value }) => {
          const nextKeyPath = isNonEmptyString(keyPath)
            ? `${keyPath}.${id}`
            : String(id);

          return (
            <JsonNode
              key={id}
              label={label}
              value={value}
              depth={depth + 1}
              keyPath={nextKeyPath}
            />
          );
        })
      )}
    </ul>
  );

  const handleArrowClick = () => {
    setIsOpen(!isOpen);
  };

  if (hideRoot) {
    return <li className={styles.container}>{renderedChildren}</li>;
  }

  return (
    <Collapsible.Root
      className={styles.container}
      open={isOpen}
      render={<li />}
    >
      <div className={styles.labelContainer}>
        <JsonArrow
          isOpen={isOpen}
          onClick={handleArrowClick}
          variant={
            highlighting === 'partial-blue'
              ? 'blue'
              : highlighting === 'red'
                ? highlighting
                : undefined
          }
        />

        <JsonNodeLabel
          label={label}
          Icon={Icon}
          highlighting={highlighting === 'red' ? highlighting : undefined}
        />

        {renderElementsCount && (
          <span
            className={clsx(
              styles.elementsCount,
              highlighting === 'red' && styles.elementsCountRed,
            )}
          >
            {renderElementsCount(elements.length)}
          </span>
        )}
      </div>

      <Collapsible.Panel className={styles.panel}>
        {renderedChildren}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
