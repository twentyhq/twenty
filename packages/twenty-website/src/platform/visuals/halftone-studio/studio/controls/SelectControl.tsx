'use client';

import { styled } from '@linaria/react';
import type { ChangeEventHandler, ReactNode } from 'react';

import { TAB_LABEL_WIDTH } from './controls-form-constants';
import { SelectInput } from './select-input';

const SelectLabel = styled.label`
  align-items: center;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: ${TAB_LABEL_WIDTH}px minmax(0, 1fr);
`;

type SelectControlProps = {
  children: ReactNode;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  value: string;
  options: Array<{ label: string; value: string }>;
};

export function SelectControl({
  children,
  onChange,
  options,
  value,
}: SelectControlProps) {
  return (
    <SelectLabel>
      <span>{children}</span>
      <SelectInput onChange={onChange} value={value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectInput>
    </SelectLabel>
  );
}
