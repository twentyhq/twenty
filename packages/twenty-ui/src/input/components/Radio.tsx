import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import * as React from 'react';
import { RadioGroup } from './RadioGroup';

export enum RadioSize {
  Large = 'large',
  Small = 'small',
}

export enum LabelPosition {
  Left = 'left',
  Right = 'right',
}

const StyledContainer = styled.div<{ labelPosition?: LabelPosition }>`
  ${({ labelPosition }) =>
    labelPosition === LabelPosition.Left
      ? `
    flex-direction: row-reverse;
  `
      : `
    flex-direction: row;
  `};
  align-items: center;
  display: inline-flex;
`;

type RadioInputProps = {
  'radio-size'?: RadioSize;
};

const StyledRadioInput = styled(motion.input)<RadioInputProps>`
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.font.color.secondary};
  border-radius: ${({ theme }) => theme.border.radius.rounded};
  height: ${({ 'radio-size': radioSize }) =>
    radioSize === RadioSize.Large ? '18px' : '16px'};
  margin: 0;
  margin-left: 3px;
  position: relative;
  width: ${({ 'radio-size': radioSize }) =>
    radioSize === RadioSize.Large ? '18px' : '16px'};

  :hover {
    background-color: ${({ theme, checked }) => {
      if (!checked) {
        return theme.background.tertiary;
      }
    }};
    outline: 4px solid
      ${({ theme, checked }) => {
        if (!checked) {
          return theme.background.tertiary;
        }
        return theme.color.transparent.blue2;
      }};
  }

  &:checked {
    background-color: ${({ theme }) => theme.color.blue};
    border: none;
    &::after {
      background-color: ${({ theme }) => theme.grayScale.gray1};
      border-radius: 50%;
      content: '';
      height: ${({ 'radio-size': radioSize }) =>
        radioSize === RadioSize.Large ? '8px' : '6px'};
      left: 50%;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: ${({ 'radio-size': radioSize }) =>
        radioSize === RadioSize.Large ? '8px' : '6px'};
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.12;
  }
`;

type LabelProps = {
  disabled?: boolean;
  labelPosition?: LabelPosition;
};

const StyledLabel = styled.label<LabelProps>`
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-left: ${({ theme, labelPosition }) =>
    labelPosition === LabelPosition.Right ? theme.spacing(2) : '0px'};
  margin-right: ${({ theme, labelPosition }) =>
    labelPosition === LabelPosition.Left ? theme.spacing(2) : '0px'};
  opacity: ${({ disabled }) => (disabled ? 0.32 : 1)};
`;

export type RadioProps = {
  checked?: boolean;
  className?: string;
  name?: string;
  disabled?: boolean;
  label?: string;
  labelPosition?: LabelPosition;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckedChange?: (checked: boolean) => void;
  size?: RadioSize;
  style?: React.CSSProperties;
  value?: string;
};

export const Radio = ({
  checked,
  className,
  name = 'input-radio',
  disabled = false,
  label,
  labelPosition = LabelPosition.Right,
  onChange,
  onCheckedChange,
  size = RadioSize.Small,
  value,
}: RadioProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.target.checked);
  };

  const optionId = React.useId();

  return (
    <StyledContainer className={className} labelPosition={labelPosition}>
      <StyledRadioInput
        type="radio"
        id={optionId}
        name={name}
        data-testid="input-radio"
        tabIndex={-1}
        checked={checked}
        value={value || label}
        radio-size={size}
        disabled={disabled}
        onChange={handleChange}
        initial={{ scale: 0.95 }}
        animate={{ scale: checked ? 1.05 : 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
      {label && (
        <StyledLabel
          htmlFor={optionId}
          labelPosition={labelPosition}
          disabled={disabled}
        >
          {label}
        </StyledLabel>
      )}
    </StyledContainer>
  );
};

Radio.Group = RadioGroup;
