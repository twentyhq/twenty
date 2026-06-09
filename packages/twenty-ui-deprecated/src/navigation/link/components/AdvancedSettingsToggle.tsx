import { styled } from '@linaria/react';
import { Toggle } from '@ui/input';
import { ThemeContext, themeCssVariables } from '@ui/theme-constants';
import { useContext, useId } from 'react';

const StyledContainer = styled.label`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: ${themeCssVariables.spacing[5]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledText = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

type AdvancedSettingsToggleProps = {
  isAdvancedModeEnabled: boolean;
  setIsAdvancedModeEnabled: (enabled: boolean) => void;
  label?: string;
};

export const AdvancedSettingsToggle = ({
  isAdvancedModeEnabled,
  setIsAdvancedModeEnabled,
  label = 'Advanced',
}: AdvancedSettingsToggleProps) => {
  const { theme } = useContext(ThemeContext);

  const onChange = (newValue: boolean) => {
    setIsAdvancedModeEnabled(newValue);
  };
  const instanceId = useId();

  return (
    <StyledContainer htmlFor={instanceId}>
      <StyledText>{label}</StyledText>
      <Toggle
        id={instanceId}
        onChange={onChange}
        color={theme.color.yellow}
        value={isAdvancedModeEnabled}
      />
    </StyledContainer>
  );
};
