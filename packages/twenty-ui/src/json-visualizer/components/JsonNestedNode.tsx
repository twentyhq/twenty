import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type IconComponent } from '@ui/display';
import { JsonArrow } from '@ui/json-visualizer/components/internal/JsonArrow';
import { JsonNodeLabel } from '@ui/json-visualizer/components/internal/JsonNodeLabel';
import { JsonNodeValue } from '@ui/json-visualizer/components/internal/JsonNodeValue';
import { JsonNode } from '@ui/json-visualizer/components/JsonNode';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';
import { themeCssVariables } from '@ui/theme-constants';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';

const StyledContainer = styled.li`
  display: grid;
  list-style-type: none;
`;

const StyledLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledElementsCount = styled.span<{
  variant?: 'red';
}>`
  color: ${({ variant }) =>
    variant === 'red'
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.tertiary};
`;

const StyledJsonListBase = styled.ul<{
  depth: number;
}>`
  margin: 0;
  padding: 0;
  display: grid;
  row-gap: ${themeCssVariables.spacing[2]};
  padding-left: ${({ depth }) =>
    depth > 0 ? themeCssVariables.spacing[8] : '0'};

  > :first-of-type {
    margin-top: ${({ depth }) =>
      depth > 0 ? themeCssVariables.spacing[2] : '0'};
  }
`;

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
    <motion.div
      initial={{ height: 0, opacity: 0, overflow: 'clip' }}
      animate={{ height: 'auto', opacity: 1, overflow: 'clip' }}
      exit={{ height: 0, opacity: 0, overflow: 'clip' }}
      transition={{ duration: 0.3 }}
    >
      <StyledJsonListBase depth={depth}>
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
      </StyledJsonListBase>
    </motion.div>
  );

  const handleArrowClick = () => {
    setIsOpen(!isOpen);
  };

  if (hideRoot) {
    return (
      <StyledContainer>
        <AnimatePresence initial={false}>{renderedChildren}</AnimatePresence>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledLabelContainer>
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
          <StyledElementsCount
            variant={highlighting === 'red' ? 'red' : undefined}
          >
            {renderElementsCount(elements.length)}
          </StyledElementsCount>
        )}
      </StyledLabelContainer>

      <AnimatePresence initial={false}>
        {isOpen && renderedChildren}
      </AnimatePresence>
    </StyledContainer>
  );
};
