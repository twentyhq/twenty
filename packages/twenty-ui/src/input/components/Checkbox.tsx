import { styled } from '@linaria/react';

import { IconCheck, IconMinus } from '@ui/display/icon/components/TablerIcons';
import { theme } from '@ui/theme';
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

const StyledCheckboxContainer = styled.div<InputProps>`
  --checkbox-outer-size: ${({ checkboxSize, hoverable }) => {
    if (hoverable === true) {
      return checkboxSize === CheckboxSize.Large ? '32px' : '24px';
    } else {
      return checkboxSize === CheckboxSize.Large ? '20px' : '14px';
    }
  }};
  --checkbox-label-size: ${({ checkboxSize }) =>
    checkboxSize === CheckboxSize.Large ? '18px' : '12px'};
  --checkbox-icon-size: ${({ checkboxSize }) =>
    checkboxSize === CheckboxSize.Large ? '20px' : '14px'};
  --checkbox-bg: ${({ indeterminate, isChecked, disabled, accent }) => {
    if (!(indeterminate || isChecked)) return 'transparent';
    return disabled === true
      ? accent === CheckboxAccent.Blue
        ? theme.color.blue7
        : theme.color.orange7
      : accent === CheckboxAccent.Blue
        ? theme.color.blue
        : theme.color.orange;
  }};
  --checkbox-border-color: ${({
    indeterminate,
    isChecked,
    variant,
    disabled,
    accent,
  }) => {
    switch (true) {
      case indeterminate || isChecked:
        return disabled === true
          ? accent === CheckboxAccent.Blue
            ? theme.color.blue7
            : theme.color.orange7
          : accent === CheckboxAccent.Blue
            ? theme.color.blue
            : theme.color.orange;
      case disabled === true:
        return theme.border.color.strong;
      case variant === CheckboxVariant.Primary:
        return theme.border.color.inverted;
      case variant === CheckboxVariant.Tertiary:
        return theme.border.color.medium;
      default:
        return theme.border.color.secondaryInverted;
    }
  }};
  --checkbox-border-radius: ${({ shape }) =>
    shape === CheckboxShape.Rounded
      ? theme.border.radius.rounded
      : theme.border.radius.sm};
  --checkbox-border-width: ${({ variant, checkboxSize }) =>
    checkboxSize === CheckboxSize.Large || variant === CheckboxVariant.Tertiary
      ? '1.43px'
      : '1px'};
  --checkbox-cursor: ${({ disabled }) =>
    disabled === true ? 'not-allowed' : 'pointer'};
  --checkbox-stroke: ${theme.font.color.inverted};

  align-items: center;
  border-radius: ${({ shape }) =>
    shape === CheckboxShape.Rounded
      ? theme.border.radius.rounded
      : theme.border.radius.md};
  cursor: var(--checkbox-cursor);
  display: flex;
  padding: ${({ checkboxSize, hoverable }) => {
    if (hoverable === true) {
      return checkboxSize === CheckboxSize.Large
        ? theme.spacing[1.5]
        : theme.spacing[1.25];
    } else {
      return '0';
    }
  }};
  position: relative;

  &:hover {
    background-color: ${({
      hoverable,
      isChecked,
      indeterminate,
      disabled,
      accent,
    }) => {
      if (hoverable !== true || disabled === true) return 'transparent';
      if (indeterminate === true || isChecked === true) {
        return accent === CheckboxAccent.Blue
          ? theme.background.transparent.blue
          : theme.background.transparent.orange;
      }
      return theme.background.transparent.light;
    }};
  }

  input + label {
    cursor: var(--checkbox-cursor);
    height: calc(var(--checkbox-label-size) + 2px);
    padding: 0;
    position: relative;
    width: calc(var(--checkbox-label-size) + 2px);
  }

  input + label:before {
    background: var(--checkbox-bg);
    border-color: var(--checkbox-border-color);
    border-radius: var(--checkbox-border-radius);
    border-style: solid;
    border-width: var(--checkbox-border-width);
    content: '';
    cursor: var(--checkbox-cursor);
    display: inline-block;
    height: var(--checkbox-label-size);
    width: var(--checkbox-label-size);
  }

  input + label > svg {
    --padding: 0px;
    height: var(--checkbox-icon-size);
    left: var(--padding);
    position: absolute;
    stroke: var(--checkbox-stroke);
    top: var(--padding);
    width: var(--checkbox-icon-size);
  }
`;

const StyledCheckboxInput = styled.input`
  cursor: ${({ disabled }) => (disabled === true ? 'not-allowed' : 'pointer')};
  margin: 0;
  opacity: 0;
  position: absolute;
  z-index: 10;
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
    <StyledCheckboxContainer
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
      <StyledCheckboxInput
        autoComplete="off"
        type="checkbox"
        id={checkboxId}
        name="styled-checkbox"
        data-testid="input-checkbox"
        checked={isInternalChecked}
        onChange={handleChange}
        disabled={disabled}
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
    </StyledCheckboxContainer>
  );
};
