import { styled } from '@linaria/react';

import { fontFamily } from '@/tokens';

// The dark studio's native <select>, shared by SelectControl and the Design
// tab's grouped source picker (which needs <optgroup> children of its own).
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
  font-family: ${fontFamily('sans')};
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
