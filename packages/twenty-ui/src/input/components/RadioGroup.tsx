import React from 'react';

import { type RadioProps } from './Radio';
import { themeCssVariables } from '@ui/theme';

type RadioGroupProps = React.PropsWithChildren & {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
};

export const RadioGroup = ({
  value,
  onChange,
  onValueChange,
  children,
}: RadioGroupProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
  };

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<RadioProps>(child)) {
          return React.cloneElement(child, {
            style: { marginBottom: themeCssVariables.spacing[2] },
            checked: child.props.value === value,
            onChange: handleChange,
          });
        }
        return child;
      })}
    </>
  );
};
