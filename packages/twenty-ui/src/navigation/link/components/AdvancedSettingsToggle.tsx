import { styled } from '@linaria/react';
import { IconPoint } from '@ui/display';
import { Toggle } from '@ui/input';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import { useContext, useId } from 'react';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  position: relative;
  height: ${themeCssVariables.spacing[5]};
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledText = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  left: calc(-1 * ${themeCssVariables.spacing[5]});
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
    <StyledContainer>
      <StyledIconContainer>
        <IconPoint
          size={12}
          color={theme.color.yellow}
          fill={theme.color.yellow}
        />
      </StyledIconContainer>
      <StyledToggleContainer htmlFor={instanceId}>
        <StyledText>{label}</StyledText>

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
