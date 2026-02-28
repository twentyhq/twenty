import { styled } from '@linaria/react';

import { type ColorScheme } from '@ui/input/types/ColorScheme';
import { MOBILE_VIEWPORT, theme } from '@ui/theme';
import { ColorSchemeCard } from './ColorSchemeCard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${theme.spacing[4]};
  }
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    overflow: scroll;
  }
`;

const StyledCardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledLabel = styled.span`
  color: ${theme.font.color.secondary};
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.medium};
  margin-top: ${theme.spacing[2]};
`;

export type ColorSchemePickerProps = {
  value: ColorScheme;
  className?: string;
  onChange: (value: ColorScheme) => void;
  lightLabel: string;
  darkLabel: string;
  systemLabel: string;
};

export const ColorSchemePicker = ({
  value,
  onChange,
  className,
  lightLabel,
  darkLabel,
  systemLabel,
}: ColorSchemePickerProps) => {
  return (
    <StyledContainer className={className}>
      <StyledCardContainer>
        <ColorSchemeCard
          onClick={() => onChange('Light')}
          variant="Light"
          selected={value === 'Light'}
        />
        <StyledLabel>{lightLabel}</StyledLabel>
      </StyledCardContainer>
      <StyledCardContainer>
        <ColorSchemeCard
          onClick={() => onChange('Dark')}
          variant="Dark"
          selected={value === 'Dark'}
        />
        <StyledLabel>{darkLabel}</StyledLabel>
      </StyledCardContainer>
      <StyledCardContainer>
        <ColorSchemeCard
          onClick={() => onChange('System')}
          variant="System"
          selected={value === 'System'}
        />
        <StyledLabel>{systemLabel}</StyledLabel>
      </StyledCardContainer>
    </StyledContainer>
  );
};
