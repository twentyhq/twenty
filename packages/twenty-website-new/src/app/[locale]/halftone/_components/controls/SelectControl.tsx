'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ChangeEventHandler, ReactNode } from 'react';

import { TAB_LABEL_WIDTH } from './controls-form-constants';

export const SelectLabel = styled.label`
  align-items: center;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: ${TAB_LABEL_WIDTH}px minmax(0, 1fr);
`;

export const SelectInput = styled.select`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: rgba(255, 255, 255, 0.07);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.52)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 12px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  height: 24px;
  outline: none;
  padding: 0 34px 0 10px;
  transition: border-color 0.15s ease;
  width: 100%;

  &:hover {
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:focus-visible {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15);
  }
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
