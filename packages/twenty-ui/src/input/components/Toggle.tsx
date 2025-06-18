import styled from '@emotion/styled';
import { VisibilityHiddenInput } from '@ui/accessibility';
import { motion } from 'framer-motion';

export type ToggleSize = 'small' | 'medium';

type ContainerProps = {
  isOn: boolean;
  color?: string;
  toggleSize: ToggleSize;
  'data-disabled'?: boolean;
};

const StyledContainer = styled.label<ContainerProps>`
  align-items: center;
  background-color: ${({ theme, isOn, color }) =>
    isOn ? (color ?? theme.color.blue) : theme.background.transparent.medium};
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: ${({ toggleSize }) => (toggleSize === 'small' ? 16 : 20)}px;
  opacity: ${({ 'data-disabled': disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ 'data-disabled': disabled }) =>
    disabled ? 'none' : 'auto'};
  position: relative;
  transition: background-color 0.3s ease;
  width: ${({ toggleSize }) => (toggleSize === 'small' ? 24 : 32)}px;
`;

const StyledCircle = styled(motion.span)<{
  size: ToggleSize;
}>`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: 50%;
  display: block;
  height: ${({ size }) => (size === 'small' ? 12 : 16)}px;
  left: 0;
  position: absolute;
  width: ${({ size }) => (size === 'small' ? 12 : 16)}px;
`;

export type ToggleProps = {
  id?: string;
  value?: boolean;
  onChange?: (value: boolean, e?: React.MouseEvent<HTMLDivElement>) => void;
  color?: string;
  toggleSize?: ToggleSize;
  className?: string;
  disabled?: boolean;
};

export const Toggle = ({
  id,
  value = false,
  onChange,
  color,
  toggleSize = 'medium',
  className,
  disabled,
}: ToggleProps) => {
  const circleVariants = {
    on: { x: toggleSize === 'small' ? 10 : 14 },
    off: { x: 2 },
  };

  return (
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
        onChange={(event) => {
          onChange?.(event.target.checked);
        }}
      />

      <StyledCircle
        initial="off"
        animate={value ? 'on' : 'off'}
        variants={circleVariants}
        size={toggleSize}
      />
    </StyledContainer>
  );
};
