import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type IconComponent } from '@ui/display';

const StyledMenuItemPicker = styled.button<{
  selected: boolean;
  disabled: boolean;
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
      return css`
        background: inherit;
        border-color: ${theme.border.color.medium};
        color: ${theme.font.color.tertiary};
        cursor: default;

        &:hover {
          background: inherit;
        }
      `;
    }

    if (selected) {
      return css`
        background: transparent;
        border-color: ${theme.color.blue};
        color: ${theme.color.blue};

        &:hover {
          background: ${theme.background.transparent.primary};
        }
      `;
    }

    return css`
      background: transparent;
      border-color: ${theme.border.color.medium};
      color: ${theme.font.color.tertiary};

      &:hover {
        background: ${theme.background.transparent.light};
      }
    `;
  }}
`;

const StyledIconContainer = styled.div`
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
}>`
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: 1;
  max-width: 100%;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${({ theme, selected, disabled }) => {
    if (disabled) {
      return css`
        color: ${theme.font.color.tertiary};
      `;
    }

    if (selected) {
      return css`
        color: ${theme.color.blue};
      `;
    }

    return css`
      color: ${theme.font.color.tertiary};
    `;
  }}
`;

export type MenuPickerProps = {
  className?: string;
  disabled?: boolean;
  icon: IconComponent;
  label: string;
  onClick?: () => void;
  selected?: boolean;
  showLabel?: boolean;
  testId?: string;
};

export const MenuPicker = ({
  icon: Icon,
  label,
  selected = false,
  disabled = false,
  showLabel = true,
  onClick,
  className,
  testId,
}: MenuPickerProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemPicker
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

      {showLabel && (
        <StyledLabel selected={selected} disabled={disabled}>
          {label}
        </StyledLabel>
      )}
    </StyledMenuItemPicker>
  );
};
