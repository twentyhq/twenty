import styled from '@emotion/styled';

import { ColorScheme } from '@ui/input/types/ColorScheme';
import { MOBILE_VIEWPORT } from '@ui/theme';
import { ColorSchemeCard } from './ColorSchemeCard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
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
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export type ColorSchemePickerProps = {
  value: ColorScheme;
  className?: string;
  onChange: (value: ColorScheme) => void;
};

export const ColorSchemePicker = ({
  value,
  onChange,
  className,
}: ColorSchemePickerProps) => (
  <StyledContainer className={className}>
    <StyledCardContainer>
      <ColorSchemeCard
        onClick={() => onChange('Light')}
        variant="Light"
        selected={value === 'Light'}
      />
      <StyledLabel>Light</StyledLabel>
    </StyledCardContainer>
    <StyledCardContainer>
      <ColorSchemeCard
        onClick={() => onChange('Dark')}
        variant="Dark"
        selected={value === 'Dark'}
      />
      <StyledLabel>Dark</StyledLabel>
    </StyledCardContainer>
    <StyledCardContainer>
      <ColorSchemeCard
        onClick={() => onChange('System')}
        variant="System"
        selected={value === 'System'}
      />
      <StyledLabel>System settings</StyledLabel>
    </StyledCardContainer>
  </StyledContainer>
);
