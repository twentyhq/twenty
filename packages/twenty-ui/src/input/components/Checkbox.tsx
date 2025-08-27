import { styled } from '@linaria/react';

import { IconCheck, IconMinus } from '@ui/display/icon/components/TablerIcons';
import * as React from 'react';

export enum CheckboxVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
}

export enum CheckboxShape {
  Squared = 'squared',
  Rounded = 'rounded',
}

export enum CheckboxSize {
  Large = 'large',
  Small = 'small',
}

export enum CheckboxAccent {
  Blue = 'blue',
  Orange = 'orange',
}

type CheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  hoverable?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckedChange?: (value: boolean) => void;
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  shape?: CheckboxShape;
  className?: string;
  disabled?: boolean;
  accent?: CheckboxAccent;
};

type InputProps = {
  checkboxSize: CheckboxSize;
  variant: CheckboxVariant;
  accent?: CheckboxAccent;
  indeterminate?: boolean;
  hoverable?: boolean;
  shape?: CheckboxShape;
  isChecked?: boolean;
  disabled?: boolean;
};

const StyledInputContainer = styled.div<InputProps>`
  --size: ${({ checkboxSize, hoverable }) => {
    if (hoverable === true) {
      return checkboxSize === CheckboxSize.Large ? '32px' : '24px';
    } else {
      return checkboxSize === CheckboxSize.Large ? '20px' : '14px';
    }
  }};
  align-items: center;
  border-radius: ${({ shape }) =>
    shape === CheckboxShape.Rounded
      ? 'var(--border-radius-rounded)'
      : 'var(--border-radius-md)'};

  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  padding: ${({ checkboxSize, hoverable }) => {
    if (hoverable === true) {
      return checkboxSize === CheckboxSize.Large
        ? 'var(--spacing-1.5)'
        : 'var(--spacing-1.25)';
    } else {
      return 0;
    }
  }};
  position: relative;
  ${({ hoverable, isChecked, indeterminate, disabled, accent }) => {
    if (!hoverable || disabled === true) return '';
    return `&:hover{
      background-color: ${
        indeterminate || isChecked
          ? accent === CheckboxAccent.Blue
            ? 'var(--background-transparent-blue)'
            : 'var(--background-transparent-orange)'
          : 'var(--background-transparent-light)'
      };
    }}
  }`;
  }}
`;

const StyledInput = styled.input<InputProps>`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  margin: 0;
  opacity: 0;
  position: absolute;
  z-index: 10;
  & + label {
    --size: ${({ checkboxSize }) =>
      checkboxSize === CheckboxSize.Large ? '18px' : '12px'};
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    height: calc(var(--size) + 2px);
    padding: 0;
    position: relative;
    width: calc(var(--size) + 2px);
  }

  & + label:before {
    --size: ${({ checkboxSize }) =>
      checkboxSize === CheckboxSize.Large ? '18px' : '12px'};
    background: ${({ indeterminate, isChecked, disabled, accent }) => {
      if (!(indeterminate || isChecked)) return 'transparent';
      return disabled
        ? accent === CheckboxAccent.Blue
          ? 'var(--adaptive-color-blue-3)'
          : 'var(--adaptive-color-orange-3)'
        : accent === CheckboxAccent.Blue
          ? 'var(--font-color-blue)'
          : 'var(--font-color-orange)';
    }};
    border-color: ${({
      indeterminate,
      isChecked,
      variant,
      disabled,
      accent,
    }) => {
      switch (true) {
        case indeterminate || isChecked:
          return disabled
            ? accent === CheckboxAccent.Blue
              ? 'var(--adaptive-color-blue-3)'
              : 'var(--adaptive-color-orange-3)'
            : accent === CheckboxAccent.Blue
              ? 'var(--font-color-blue)'
              : 'var(--font-color-orange)';
        case disabled:
          return 'var(--border-color-strong)';
        case variant === CheckboxVariant.Primary:
          return 'var(--border-color-inverted)';
        case variant === CheckboxVariant.Tertiary:
          return 'var(--border-color-medium)';
        default:
          return 'var(--border-color-secondary-inverted)';
      }
    }};
    border-radius: ${({ shape }) =>
      shape === CheckboxShape.Rounded
        ? 'var(--border-radius-rounded)'
        : 'var(--border-radius-sm)'};
    border-style: solid;
    border-width: ${({ variant, checkboxSize }) =>
      checkboxSize === CheckboxSize.Large ||
      variant === CheckboxVariant.Tertiary
        ? '1.43px'
        : '1px'};
    content: '';
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    display: inline-block;
    height: var(--size);
    width: var(--size);
  }

  & + label > svg {
    --padding: 0px;
    --size: ${({ checkboxSize }) =>
      checkboxSize === CheckboxSize.Large ? '20px' : '14px'};
    height: var(--size);
    left: var(--padding);
    position: absolute;
    stroke: var(--font-color-inverted);
    top: var(--padding);
    width: var(--size);
  }
`;

export const Checkbox = ({
  checked,
  onChange,
  onCheckedChange,
  indeterminate,
  variant = CheckboxVariant.Primary,
  size = CheckboxSize.Small,
  shape = CheckboxShape.Squared,
  hoverable = true,
  className,
  disabled = false,
  accent = CheckboxAccent.Blue,
}: CheckboxProps) => {
  const [isInternalChecked, setIsInternalChecked] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    setIsInternalChecked(checked ?? false);
  }, [checked]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.target.checked);
    setIsInternalChecked(event.target.checked ?? false);
  };

  const checkboxId = React.useId();

  return (
    <StyledInputContainer
      checkboxSize={size}
      variant={variant}
      shape={shape}
      isChecked={isInternalChecked}
      hoverable={hoverable}
      indeterminate={indeterminate}
      className={className}
      disabled={disabled}
      accent={accent}
    >
      <StyledInput
        autoComplete="off"
        type="checkbox"
        id={checkboxId}
        name="styled-checkbox"
        data-testid="input-checkbox"
        checked={isInternalChecked}
        indeterminate={indeterminate}
        variant={variant}
        checkboxSize={size}
        shape={shape}
        isChecked={isInternalChecked}
        onChange={handleChange}
        disabled={disabled}
        accent={accent}
      />
      <label htmlFor={checkboxId}>
        {indeterminate ? (
          <IconMinus />
        ) : isInternalChecked ? (
          <IconCheck />
        ) : (
          <></>
        )}
      </label>
    </StyledInputContainer>
  );
};
