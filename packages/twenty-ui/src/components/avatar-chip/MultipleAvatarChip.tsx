import { Fragment } from 'react/jsx-runtime';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { Chip, ChipVariant } from '@ui/components/chip/Chip';

const StyledIconsContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledChipContainer = styled.div<{ clickable?: boolean }>`
  display: inline-flex;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export type MultipleAvatarChipProps = {
  Icons: React.ReactNode[];
  text?: string;
  onClick?: () => void;
  testId?: string;
  maxWidth?: number;
  forceEmptyText?: boolean;
  variant?: ChipVariant;
};

export const MultipleAvatarChip = ({
  Icons,
  text,
  onClick,
  testId,
  maxWidth,
  variant = ChipVariant.Static,
  forceEmptyText = false,
}: MultipleAvatarChipProps) => {
  const leftComponent = (
    <StyledIconsContainer>
      {Icons.map((Icon, index) => (
        <Fragment key={index}>{Icon}</Fragment>
      ))}
    </StyledIconsContainer>
  );

  const handleClick = onClick ? () => onClick() : undefined;

  return (
    <StyledChipContainer onClick={handleClick} data-testid={testId}>
      <Chip
        label={text || ''}
        isLabelHidden={!isNonEmptyString(text) && forceEmptyText}
        variant={variant}
        leftComponent={leftComponent}
        clickable={isDefined(onClick)}
        maxWidth={maxWidth}
      />
    </StyledChipContainer>
  );
};
