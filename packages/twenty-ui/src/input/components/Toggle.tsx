import styled from '@emotion/styled';
import { VisibilityHiddenInput } from '@ui/accessibility';

export type ToggleSize = 'small' | 'medium';

export type ToggleProps = {
  id?: string;
  value?: boolean;
  onChange?: (value: boolean, e?: React.MouseEvent<HTMLDivElement>) => void;
  color?: string;
  toggleSize?: ToggleSize;
  className?: string;
  disabled?: boolean;
};

const StyledContainer = styled.label<{
  isOn: boolean;
  color?: string;
  toggleSize: ToggleSize;
  'data-disabled'?: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  width: ${({ toggleSize }) => (toggleSize === 'small' ? 24 : 32)}px;
  height: ${({ toggleSize }) => (toggleSize === 'small' ? 16 : 20)}px;
  background-color: ${({ theme, isOn, color }) =>
    isOn ? (color ?? theme.color.blue) : theme.background.transparent.medium};
  border-radius: 10px;
  transition: background-color 0.3s ease;
  opacity: ${({ 'data-disabled': disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ 'data-disabled': disabled }) =>
    disabled ? 'none' : 'auto'};
`;

const StyledKnob = styled.span<{ isOn: boolean; size: ToggleSize }>`
  position: absolute;
  top: 50%;
  left: ${({ isOn, size }) => (isOn ? (size === 'small' ? 10 : 14) : 2)}px;
  transform: translateY(-50%);
  width: ${({ size }) => (size === 'small' ? 12 : 16)}px;
  height: ${({ size }) => (size === 'small' ? 12 : 16)}px;
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: 50%;
  transition: left 0.3s ease;
  will-change: left;
`;

export const Toggle = ({
  id,
  value = false,
  onChange,
  color,
  toggleSize = 'medium',
  className,
  disabled,
}: ToggleProps) => (
  <StyledContainer
    isOn={value}
    color={color}
    toggleSize={toggleSize}
    className={className}
    data-disabled={disabled}
  >
    <VisibilityHiddenInput
      id={id}
      type="checkbox"
      checked={value}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.checked)}
    />
    <StyledKnob isOn={value} size={toggleSize} />
  </StyledContainer>
);
