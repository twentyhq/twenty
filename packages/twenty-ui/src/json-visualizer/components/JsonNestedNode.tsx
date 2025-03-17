import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { IconComponent } from '@ui/display';
import { JsonArrow } from '@ui/json-visualizer/components/internal/JsonArrow';
import { JsonList } from '@ui/json-visualizer/components/internal/JsonList';
import { JsonNodeLabel } from '@ui/json-visualizer/components/internal/JsonNodeLabel';
import { JsonNode } from '@ui/json-visualizer/components/JsonNode';
import { useState } from 'react';
import { isDefined } from 'twenty-shared';
import { JsonValue } from 'type-fest';

const StyledContainer = styled.li`
  list-style-type: none;
  display: grid;
  row-gap: ${({ theme }) => theme.spacing(2)};
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
    <JsonList depth={depth}>
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
    </JsonList>
  );

  const handleArrowClick = () => {
    setIsOpen(!isOpen);
  };

  if (hideRoot) {
    return <StyledContainer>{renderedChildren}</StyledContainer>;
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

      {isOpen && renderedChildren}
    </StyledContainer>
  );
};
