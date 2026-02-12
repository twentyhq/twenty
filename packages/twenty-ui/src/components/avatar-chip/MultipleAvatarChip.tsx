import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment } from 'react/jsx-runtime';
import { isDefined } from 'twenty-shared/utils';

import { Chip, ChipVariant } from '@ui/components/chip/Chip';

const StyledIconsContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledChipContainer = styled.div`
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
  rightComponent?: React.ReactNode;
  emptyLabel?: string;
};

export const MultipleAvatarChip = ({
  Icons,
  text,
  onClick,
  testId,
  maxWidth,
  rightComponent,
  variant = ChipVariant.Static,
  forceEmptyText = false,
  emptyLabel,
}: MultipleAvatarChipProps) => {
  return (
    <StyledChipContainer onClick={onClick} data-testid={testId}>
      <Chip
        label={text || ''}
        forceEmptyText={forceEmptyText}
        isLabelHidden={!isNonEmptyString(text) && forceEmptyText}
        variant={variant}
        leftComponent={
          <StyledIconsContainer>
            {Icons.map((Icon, index) => (
              <Fragment key={index}>{Icon}</Fragment>
            ))}
          </StyledIconsContainer>
        }
        rightComponent={rightComponent}
        clickable={isDefined(onClick)}
        maxWidth={maxWidth}
        emptyLabel={emptyLabel}
      />
    </StyledChipContainer>
  );
};
