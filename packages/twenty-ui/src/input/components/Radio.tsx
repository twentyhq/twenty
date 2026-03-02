import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import * as React from 'react';

import { themeCssVariables } from '@ui/theme';
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

const StyledRadioInputBase = styled.input<RadioInputProps>`
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  border: 1px solid ${themeCssVariables.font.color.secondary};
  border-radius: ${themeCssVariables.border.radius.rounded};
  height: ${({ 'radio-size': radioSize }) =>
    radioSize === RadioSize.Large ? '18px' : '16px'};
  margin: 0;
  margin-left: 3px;
  position: relative;
  width: ${({ 'radio-size': radioSize }) =>
    radioSize === RadioSize.Large ? '18px' : '16px'};

  :hover {
    background-color: ${({ checked }) => {
      if (!checked) {
        return themeCssVariables.background.tertiary;
      }
      return '';
    }};
    outline: 4px solid
      ${({ checked }) => {
        if (!checked) {
          return themeCssVariables.background.tertiary;
        }
        return themeCssVariables.color.transparent.blue2;
      }};
  }

  &:checked {
    background-color: ${themeCssVariables.color.blue};
    border: none;
    &::after {
      background-color: ${themeCssVariables.grayScale.gray1};
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

const StyledRadioInput = motion.create(StyledRadioInputBase);

type LabelProps = {
  disabled?: boolean;
  labelPosition?: LabelPosition;
};

const StyledLabel = styled.label<LabelProps>`
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  margin-left: ${({ labelPosition }) =>
    labelPosition === LabelPosition.Right
      ? themeCssVariables.spacing[2]
      : '0px'};
  margin-right: ${({ labelPosition }) =>
    labelPosition === LabelPosition.Left
      ? themeCssVariables.spacing[2]
      : '0px'};
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
