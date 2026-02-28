import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import {
  AppTooltip,
  TooltipDelay,
  TooltipPosition,
  type IconComponent,
} from '@ui/display';
import { ThemeContext, themeVar } from '@ui/theme';
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
  border: 1px solid ${themeVar.border.color.medium};
  border-radius: ${themeVar.border.radius.sm};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeVar.spacing[1]};
  justify-content: center;
  min-height: ${themeVar.spacing[8]};
  padding: ${themeVar.spacing[1.5]} ${themeVar.spacing[1]};
  transition: all ${themeVar.animation.duration.instant}s ease;
  user-select: none;
  width: 100%;

  background: ${({ disabled }) =>
    disabled ? themeVar.background.secondary : 'transparent'};

  border-color: ${({ selected, disabled }) => {
    if (disabled) {
      return themeVar.border.color.medium;
    }
    if (selected) {
      return themeVar.color.blue;
    }
    return themeVar.border.color.medium;
  }};

  color: ${({ selected, disabled }) => {
    if (disabled) {
      return themeVar.font.color.extraLight;
    }
    if (selected) {
      return themeVar.color.blue;
    }
    return themeVar.font.color.tertiary;
  }};

  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

  &:hover {
    background: ${({ selected, disabled }) => {
      if (disabled) {
        return themeVar.background.secondary;
      }
      if (selected) {
        return themeVar.background.transparent.primary;
      }
      return themeVar.background.transparent.light;
    }};
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: ${themeVar.icon.size.md}px;
  justify-content: center;
  width: ${themeVar.icon.size.md}px;
`;

const StyledLabel = styled.div<{
  disabled: boolean;
  selected: boolean;
}>`
  color: ${({ selected, disabled }) => {
    if (disabled) {
      return themeVar.font.color.extraLight;
    }
    if (selected) {
      return themeVar.color.blue;
    }
    return themeVar.font.color.tertiary;
  }};
  font-family: ${themeVar.font.family};
  font-size: ${themeVar.font.size.xs};
  font-weight: ${themeVar.font.weight.semiBold};
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
