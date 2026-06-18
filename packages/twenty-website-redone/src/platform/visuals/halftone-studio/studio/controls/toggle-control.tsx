'use client';

import { styled } from '@linaria/react';
import type { ChangeEventHandler, ReactNode } from 'react';

import { ToggleSwitch } from './toggle-switch';

const ToggleRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
`;

const ToggleText = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
`;

type ToggleControlProps = {
  checked: boolean;
  label: ReactNode;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function ToggleControl({
  checked,
  label,
  onChange,
}: ToggleControlProps) {
  return (
    <ToggleRow>
      <ToggleText>{label}</ToggleText>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </ToggleRow>
  );
}
