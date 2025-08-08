import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { type IconComponent } from '@ui/display';
import { JsonArrow } from '@ui/json-visualizer/components/internal/JsonArrow';
import { JsonList } from '@ui/json-visualizer/components/internal/JsonList';
import { JsonNodeLabel } from '@ui/json-visualizer/components/internal/JsonNodeLabel';
import { JsonNodeValue } from '@ui/json-visualizer/components/internal/JsonNodeValue';
import { JsonNode } from '@ui/json-visualizer/components/JsonNode';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';
import { ANIMATION } from '@ui/theme';
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
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledElementsCount = styled.span<{ variant?: 'red' }>`
  color: ${({ theme, variant }) =>
    variant === 'red' ? theme.font.color.danger : theme.font.color.tertiary};
`;

const StyledJsonList = styled(JsonList)``.withComponent(motion.ul);

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
    <StyledJsonList
      initial={{
        height: 0,
        opacity: 0,
        overflowY: 'clip',
      }}
      animate={{
        height: 'auto',
        opacity: 1,
        overflowY: 'clip',
      }}
      exit={{
        height: 0,
        opacity: 0,
        overflowY: 'clip',
      }}
      transition={{ duration: ANIMATION.duration.normal }}
      depth={depth}
    >
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
    </StyledJsonList>
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
