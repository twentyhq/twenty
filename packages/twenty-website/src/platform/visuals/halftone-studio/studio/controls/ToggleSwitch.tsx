'use client';

import { styled } from '@linaria/react';
import type { ChangeEventHandler } from 'react';

const Toggle = styled.label`
  display: block;
  flex-shrink: 0;
  height: 18px;
  position: relative;
  width: 28px;
`;

const ToggleInput = styled.input`
  height: 0;
  opacity: 0;
  position: absolute;
  width: 0;

  &:checked + span {
    background: #4a38f5;
  }

  &:checked + span::after {
    transform: translateX(12px);
  }
`;

const ToggleTrack = styled.span`
  background: rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  cursor: pointer;
  inset: 0;
  position: absolute;
  transition: background 0.2s ease;

  &::after {
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
    content: '';
    height: 12px;
    left: 2px;
    position: absolute;
    top: 3px;
    transition: transform 0.2s ease;
    width: 12px;
  }
`;

type ToggleSwitchProps = {
  ariaLabelledBy?: string;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function ToggleSwitch({
  ariaLabelledBy,
  checked,
  onChange,
}: ToggleSwitchProps) {
  return (
    <Toggle>
      <ToggleInput
        aria-labelledby={ariaLabelledBy}
        checked={checked}
        onChange={onChange}
        type="checkbox"
      />
      <ToggleTrack />
    </Toggle>
  );
}
