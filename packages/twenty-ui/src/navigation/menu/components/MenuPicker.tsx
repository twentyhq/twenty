import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import {
  AppTooltip,
  TooltipDelay,
  TooltipPosition,
  type IconComponent,
} from '@ui/display';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { isDefined } from 'twenty-shared/utils';

const StyledMenuPicker = styled.button<{
  selected: boolean;
  disabled: boolean;
  theme: ThemeType;
}>`
  box-sizing: border-box;
  background: none;
  font: inherit;
  outline: inherit;
  color: inherit;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  min-height: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => `${theme.spacing(1.5)} ${theme.spacing(1)}`};
  transition: all ${({ theme }) => theme.animation.duration.instant}s ease;
  user-select: none;
  width: 100%;

  ${({ theme, selected, disabled }) => {
    if (disabled) {
      return `
        background: ${theme.background.secondary};
        border-color: ${theme.border.color.medium};
        color: ${theme.font.color.extraLight};
        cursor: default;
      `;
    }

    if (selected) {
      return `
        background: transparent;
        border-color: ${theme.color.blue};
        color: ${theme.color.blue};

        &:hover {
          background: ${theme.background.transparent.primary};
        }
      `;
    }

    return `
      background: transparent;
      border-color: ${theme.border.color.medium};
      color: ${theme.font.color.tertiary};

      &:hover {
        background: ${theme.background.transparent.light};
      }
    `;
  }}
`;

const StyledIconContainer = styled.div<{ theme: ThemeType }>`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: ${({ theme }) => theme.icon.size.md}px;
  justify-content: center;
  width: ${({ theme }) => theme.icon.size.md}px;
`;

const StyledLabel = styled.div<{
  disabled: boolean;
  selected: boolean;
  theme: ThemeType;
}>`
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  max-width: 100%;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${({ theme, selected, disabled }) => {
    if (disabled) {
      return `
        color: ${theme.font.color.extraLight};
      `;
    }

    if (selected) {
      return `
        color: ${theme.color.blue};
      `;
    }

    return `
      color: ${theme.font.color.tertiary};
    `;
  }}
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
        theme={theme}
      >
        <StyledIconContainer theme={theme}>
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        </StyledIconContainer>

        {isDefined(label) && showLabel && (
          <StyledLabel selected={selected} disabled={disabled} theme={theme}>
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
