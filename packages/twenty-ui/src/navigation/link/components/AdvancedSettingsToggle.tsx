import { styled } from '@linaria/react';
import { IconPoint } from '@ui/display';
import { Toggle } from '@ui/input';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { useContext, useId } from 'react';

const StyledContainer = styled.div<{ theme: ThemeType }>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  position: relative;
  height: ${({ theme }) => theme.spacing(5)};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledText = styled.div<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledIconContainer = styled.div<{ theme: ThemeType }>`
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

  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer theme={theme}>
      <StyledIconContainer theme={theme}>
        <IconPoint
          size={12}
          color={theme.color.yellow}
          fill={theme.color.yellow}
        />
      </StyledIconContainer>
      <StyledToggleContainer htmlFor={instanceId}>
        <StyledText theme={theme}>{label}</StyledText>

        <Toggle
          id={instanceId}
          onChange={onChange}
          color={theme.color.yellow}
          value={isAdvancedModeEnabled}
        />
      </StyledToggleContainer>
    </StyledContainer>
  );
};
