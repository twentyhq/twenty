import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import {
  AppTooltip,
  TooltipDelay,
  TooltipPosition,
  type IconComponent,
} from '@ui/display';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import { isDefined } from 'twenty-shared/utils';

const StyledMenuPicker = styled.button<{
  selected: boolean;
  disabled: boolean;
}>`
  box-sizing: border-box;
  background: none;
  font: inherit;
  outline: inherit;
  color: inherit;
  align-items: center;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  min-height: ${themeCssVariables.spacing[8]};
  padding: ${themeCssVariables.spacing[1.5]} ${themeCssVariables.spacing[1]};
  transition: all calc(${themeCssVariables.animation.duration.instant} * 1s)
    ease;
  user-select: none;
  width: 100%;

  background: ${({ disabled }) =>
    disabled ? themeCssVariables.background.secondary : 'transparent'};

  border-color: ${({ selected, disabled }) => {
    if (disabled) {
      return themeCssVariables.border.color.medium;
    }
    if (selected) {
      return themeCssVariables.color.blue;
    }
    return themeCssVariables.border.color.medium;
  }};

  color: ${({ selected, disabled }) => {
    if (disabled) {
      return themeCssVariables.font.color.extraLight;
    }
    if (selected) {
      return themeCssVariables.color.blue;
    }
    return themeCssVariables.font.color.tertiary;
  }};

  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

  &:hover {
    background: ${({ selected, disabled }) => {
      if (disabled) {
        return themeCssVariables.background.secondary;
      }
      if (selected) {
        return themeCssVariables.background.transparent.primary;
      }
      return themeCssVariables.background.transparent.light;
    }};
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: calc(${themeCssVariables.icon.size.md} * 1px);
  justify-content: center;
  width: calc(${themeCssVariables.icon.size.md} * 1px);
`;

const StyledLabel = styled.div<{
  disabled: boolean;
  selected: boolean;
}>`
  color: ${({ selected, disabled }) => {
    if (disabled) {
      return themeCssVariables.font.color.extraLight;
    }
    if (selected) {
      return themeCssVariables.color.blue;
    }
    return themeCssVariables.font.color.tertiary;
  }};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  max-width: 100%;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;

  white-space: nowrap;
`;

export type MenuPickerProps = {
  id: string;
  className?: string;
  disabled?: boolean;
  icon: IconComponent;
  label?: string;
  onClick?: () => void;
  selected?: boolean;
  showLabel?: boolean;
  testId?: string;
  tooltipContent?: string;
  tooltipDelay?: TooltipDelay;
  tooltipOffset?: number;
};

export const MenuPicker = ({
  id,
  icon: Icon,
  label,
  selected = false,
  disabled = false,
  showLabel = true,
  onClick,
  className,
  testId,
  tooltipContent,
  tooltipDelay = TooltipDelay.noDelay,
  tooltipOffset = 5,
}: MenuPickerProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <>
      <StyledMenuPicker
        id={id}
        selected={selected}
        disabled={disabled}
        onClick={onClick}
        className={className}
        data-testid={testId}
        aria-pressed={selected}
        aria-disabled={disabled}
        aria-label={label}
      >
        <StyledIconContainer>
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        </StyledIconContainer>

        {isDefined(label) && showLabel && (
          <StyledLabel selected={selected} disabled={disabled}>
            {label}
          </StyledLabel>
        )}
      </StyledMenuPicker>

      {isNonEmptyString(tooltipContent) && (
        <AppTooltip
          anchorSelect={`#${id}`}
          offset={tooltipOffset}
          content={tooltipContent}
          place={TooltipPosition.Bottom}
          positionStrategy="fixed"
          delay={tooltipDelay}
          noArrow
        />
      )}
    </>
  );
};
