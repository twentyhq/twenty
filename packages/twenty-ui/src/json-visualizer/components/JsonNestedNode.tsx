import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { IconComponent } from '@ui/display';
import { JsonArrow } from '@ui/json-visualizer/components/internal/JsonArrow';
import { JsonNodeLabel } from '@ui/json-visualizer/components/internal/JsonNodeLabel';
import { JsonNode } from '@ui/json-visualizer/components/JsonNode';
import { ANIMATION } from '@ui/theme';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { isDefined } from 'twenty-shared';
import { JsonValue } from 'type-fest';

const StyledContainer = styled.li`
  display: grid;
  list-style-type: none;
`;

const StyledLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledElementsCount = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledJsonList = styled(motion.ul)<{ depth: number }>`
  position: relative;
  margin: 0;
  padding: 0;

  display: grid;
  row-gap: ${({ theme }) => theme.spacing(2)};

  ${({ theme, depth }) =>
    depth > 0 &&
    css`
      padding-left: ${theme.spacing(8)};

      > :first-child {
        margin-top: ${theme.spacing(2)};
      }
    `}
`;

export const JsonNestedNode = ({
  label,
  Icon,
  elements,
  renderElementsCount,
  emptyElementsText,
  depth,
  keyPath,
}: {
  label?: string;
  Icon: IconComponent;
  elements: Array<{ id: string | number; label: string; value: JsonValue }>;
  renderElementsCount?: (count: number) => string;
  emptyElementsText: string;
  depth: number;
  keyPath: string;
}) => {
  const hideRoot = !isDefined(label);

  const [isOpen, setIsOpen] = useState(true);

  const renderedChildren = (
    <StyledJsonList
      initial={{ height: 0, overflow: 'hidden' }}
      animate={{ height: 'auto', overflow: 'hidden' }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: ANIMATION.duration.normal }}
      depth={depth}
    >
      {elements.length === 0 ? (
        <StyledEmptyState>{emptyElementsText}</StyledEmptyState>
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
        <JsonArrow isOpen={isOpen} onClick={handleArrowClick} />

        <JsonNodeLabel label={label} Icon={Icon} />

        {renderElementsCount && (
          <StyledElementsCount>
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
