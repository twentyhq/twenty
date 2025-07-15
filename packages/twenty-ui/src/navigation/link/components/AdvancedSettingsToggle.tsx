import styled from '@emotion/styled';
import { IconPoint } from '@ui/display';
import { Toggle } from '@ui/input';
import { MAIN_COLORS } from '@ui/theme';
import { useId } from 'react';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  position: relative;
  height: ${({ theme }) => theme.spacing(5)};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  left: ${({ theme }) => theme.spacing(-5)};
  position: absolute;
`;

const StyledToggleContainer = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

type AdvancedSettingsToggleProps = {
  isAdvancedModeEnabled: boolean;
  setIsAdvancedModeEnabled: (enabled: boolean) => void;
  label?: string;
};

export const AdvancedSettingsToggle = ({
  isAdvancedModeEnabled,
  setIsAdvancedModeEnabled,
  label = 'Advanced:',
}: AdvancedSettingsToggleProps) => {
  const onChange = (newValue: boolean) => {
    setIsAdvancedModeEnabled(newValue);
  };
  const instanceId = useId();

  return (
    <StyledContainer>
      <StyledIconContainer>
        <IconPoint
          size={12}
          color={MAIN_COLORS.yellow}
          fill={MAIN_COLORS.yellow}
        />
      </StyledIconContainer>
      <StyledToggleContainer htmlFor={instanceId}>
        <StyledText>{label}</StyledText>

        <Toggle
          id={instanceId}
          onChange={onChange}
          color={MAIN_COLORS.yellow}
          value={isAdvancedModeEnabled}
        />
      </StyledToggleContainer>
    </StyledContainer>
  );
};
