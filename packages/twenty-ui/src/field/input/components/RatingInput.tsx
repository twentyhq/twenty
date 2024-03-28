import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconTwentyStarFilled } from 'src/display';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledRatingIconContainer = styled.div<{ isActive?: boolean }>`
  color: ${({ isActive, theme }) =>
    isActive ? theme.font.color.secondary : theme.background.quaternary};
  display: inline-flex;
`;

type RatingInputProps<Value> = {
  onChange: (newValue: Value) => void;
  value: Value;
  availableValues: Value[];
  readonly?: boolean;
};

export const RatingInput = <Value extends string>({
  onChange,
  value,
  availableValues,
  readonly,
}: RatingInputProps<Value>) => {
  const theme = useTheme();
  const [hoveredValue, setHoveredValue] = useState<Value | null>(null);
  const currentValue = hoveredValue ?? value;
  const currentIndex = availableValues.indexOf(currentValue);

  return (
    <StyledContainer
      role="slider"
      aria-label="Rating"
      aria-valuemax={availableValues.length}
      aria-valuemin={1}
      aria-valuenow={currentIndex + 1}
      tabIndex={0}
    >
      {availableValues.map((values, index) => (
        <StyledRatingIconContainer
          key={index}
          isActive={index <= currentIndex}
          onClick={readonly ? undefined : () => onChange(values)}
          onMouseEnter={readonly ? undefined : () => setHoveredValue(values)}
          onMouseLeave={readonly ? undefined : () => setHoveredValue(null)}
        >
          <IconTwentyStarFilled size={theme.icon.size.md} />
        </StyledRatingIconContainer>
      ))}
    </StyledContainer>
  );
};
