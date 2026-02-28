import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { isDefined } from 'twenty-shared/utils';

import { Chip, ChipVariant } from '@ui/components/chip/Chip';
import { ThemeContext, type ThemeType } from '@ui/theme';

const StyledIconsContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledChipContainer = styled.div<{ theme: ThemeType }>`
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
  const { theme } = useContext(ThemeContext);

  return (
    <StyledChipContainer onClick={onClick} data-testid={testId} theme={theme}>
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
