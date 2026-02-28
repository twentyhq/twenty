import { styled } from '@linaria/react';
import { IconPoint } from '@ui/display';
import { Toggle } from '@ui/input';
import { ThemeContext, themeVar } from '@ui/theme';
import { useContext, useId } from 'react';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeVar.spacing[2]};
  position: relative;
  height: ${themeVar.spacing[5]};
  padding: ${themeVar.spacing[1]};
`;

const StyledText = styled.div`
  color: ${themeVar.font.color.secondary};
  font-size: ${themeVar.font.size.sm};
  font-weight: ${themeVar.font.weight.medium};
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  left: calc(-1 * ${themeVar.spacing[5]});
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
