import styled from '@emotion/styled';
import { IconPoint } from '@ui/display';
import { Toggle } from '@ui/input';
import { MAIN_COLORS } from '@ui/theme';
import { useId } from 'react';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconContainer = styled.div`
  height: 16px;
  position: absolute;
  left: ${({ theme }) => theme.spacing(-3)};
`;

const StyledToggleContainer = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledIconPoint = styled(IconPoint)`
  margin-right: 0;
`;

type AdvancedSettingsToggleProps = {
  isAdvancedModeEnabled: boolean;
  setIsAdvancedModeEnabled: (enabled: boolean) => void;
};

export const AdvancedSettingsToggle = ({
  isAdvancedModeEnabled,
  setIsAdvancedModeEnabled,
}: AdvancedSettingsToggleProps) => {
  const onChange = (newValue: boolean) => {
    setIsAdvancedModeEnabled(newValue);
  };
  const inputId = useId();

  return (
    <StyledContainer>
      <StyledIconContainer>
        <StyledIconPoint
          size={12}
          color={MAIN_COLORS.yellow}
          fill={MAIN_COLORS.yellow}
        />
      </StyledIconContainer>
      <StyledToggleContainer htmlFor={inputId}>
        <StyledText>Advanced:</StyledText>

        <Toggle
          id={inputId}
          onChange={onChange}
          color={MAIN_COLORS.yellow}
          value={isAdvancedModeEnabled}
        />
      </StyledToggleContainer>
    </StyledContainer>
  );
};
