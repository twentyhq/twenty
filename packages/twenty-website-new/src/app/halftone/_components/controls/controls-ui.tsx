'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ChangeEventHandler, ReactNode } from 'react';

const TAB_LABEL_WIDTH = 72;

export const PanelShell = styled.aside`
  background: rgba(18, 18, 22, 0.88);
  backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  height: 100%;
  overflow: hidden;
  width: min(320px, calc(100vw - 32px));

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    height: 100%;
    width: 100%;
  }
`;

export const ControlsHeader = styled.div`
  padding: 20px 20px 0;
`;

export const ControlsTitle = styled.div`
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
`;

export const TabsBar = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-shrink: 0;
  padding: 12px 20px 0;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  border-bottom: 2px solid
    ${(props) => (props.$active ? '#4A38F5' : 'transparent')};
  color: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.38)'};
  cursor: pointer;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 8px 14px 10px;
  transition: all 0.2s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.6);
  }
`;

export const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

export const Section = styled.section<{ $first?: boolean }>`
  border-top: ${(props) =>
    props.$first ? 'none' : '1px solid rgba(255, 255, 255, 0.06)'};
  margin-top: ${(props) => (props.$first ? '0' : '14px')};
  padding-top: ${(props) => (props.$first ? '0' : '14px')};
`;

export const SectionTitle = styled.div`
  color: rgba(255, 255, 255, 0.36);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

export const ControlGrid = styled.div`
  display: grid;
  gap: 10px;
`;

export const SliderLabel = styled.label`
  align-items: center;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: ${TAB_LABEL_WIDTH}px minmax(0, 1fr) auto;
`;

export const SelectLabel = styled.label`
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: ${TAB_LABEL_WIDTH}px minmax(0, 1fr);
`;

export const ControlValue = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  min-width: 34px;
  text-align: right;
`;

export const SliderInput = styled.input`
  appearance: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  height: 2px;
  outline: none;
  width: 100%;

  &::-webkit-slider-thumb {
    appearance: none;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    height: 12px;
    width: 12px;
  }
`;

export const SelectInput = styled.select`
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  outline: none;
  padding: 7px 10px;
  transition: border-color 0.15s ease;
  width: 100%;

  &:hover {
    border-color: rgba(255, 255, 255, 0.25);
  }
`;

export const ToggleRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
`;

export const ToggleText = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
`;

export const Toggle = styled.label`
  display: block;
  flex-shrink: 0;
  height: 18px;
  position: relative;
  width: 34px;
`;

export const ToggleInput = styled.input`
  height: 0;
  opacity: 0;
  position: absolute;
  width: 0;

  &:checked + span {
    background: #4A38F5;
  }

  &:checked + span::after {
    transform: translateX(16px);
  }
`;

export const ToggleTrack = styled.span`
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
    left: 3px;
    position: absolute;
    top: 3px;
    transition: transform 0.2s ease;
    width: 12px;
  }
`;

export const ColorPair = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
`;

export const ColorItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const ColorItemLabel = styled.span`
  color: rgba(255, 255, 255, 0.45);
  font-size: 10px;
`;

export const ColorInput = styled.input`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  cursor: pointer;
  height: 28px;
  outline: none;
  padding: 0;
  width: 100%;

  &:hover {
    border-color: rgba(255, 255, 255, 0.28);
  }
`;

export const SecondaryActionButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px dashed rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  padding: 8px 12px;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

export const AnimOption = styled.button<{ $selected: boolean }>`
  align-items: center;
  background: ${(props) =>
    props.$selected ? 'rgba(74, 56, 245, 0.12)' : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid
    ${(props) =>
      props.$selected
        ? 'rgba(74, 56, 245, 0.4)'
        : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.14);
  }
`;

export const AnimOptionIcon = styled.div<{ $selected: boolean }>`
  align-items: center;
  background: ${(props) =>
    props.$selected ? 'rgba(74, 56, 245, 0.25)' : 'rgba(255, 255, 255, 0.06)'};
  border-radius: 8px;
  display: flex;
  flex-shrink: 0;
  font-size: 16px;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

export const AnimOptionInfo = styled.div`
  flex: 1;
`;

export const AnimOptionName = styled.div<{ $selected: boolean }>`
  color: ${(props) =>
    props.$selected ? '#9d90fa' : 'rgba(255, 255, 255, 0.85)'};
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 2px;
`;

export const AnimOptionDescription = styled.div`
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
`;

export const AnimSubSettings = styled.div<{ $visible: boolean }>`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  display: ${(props) => (props.$visible ? 'block' : 'none')};
  margin-top: 10px;
  padding: 12px;
`;

export const ExportPreview = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.55);
  font-family: ${theme.font.family.mono};
  font-size: 10px;
  line-height: 1.5;
  margin-bottom: 14px;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
`;

export const ExportButton = styled.button<{ $primary?: boolean }>`
  align-items: center;
  background: ${(props) => (props.$primary ? '#4A38F5' : 'rgba(255, 255, 255, 0.08)')};
  border: none;
  border-radius: 10px;
  color: ${(props) => (props.$primary ? '#fff' : 'rgba(255, 255, 255, 0.8)')};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: 12px;
  font-weight: 600;
  gap: 8px;
  justify-content: center;
  margin-top: ${(props) => (props.$primary ? '0' : '8px')};
  padding: 11px 16px;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background: ${(props) =>
      props.$primary ? '#5a4af7' : 'rgba(255, 255, 255, 0.14)'};
  }
`;

export const ExportNote = styled.div`
  color: rgba(255, 255, 255, 0.3);
  font-size: 10px;
  line-height: 1.5;
  margin-top: 12px;
`;

export const SmallBody = styled.p`
  color: rgba(255, 255, 255, 0.45);
  font-size: 10px;
  line-height: 1.6;
  margin-bottom: 14px;
`;

type SliderControlProps = {
  children: ReactNode;
  max: number;
  min: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  step?: number;
  value: number;
  valueLabel: string;
};

export function SliderControl({
  children,
  max,
  min,
  onChange,
  step,
  value,
  valueLabel,
}: SliderControlProps) {
  return (
    <SliderLabel>
      <span>{children}</span>
      <SliderInput
        max={max}
        min={min}
        onChange={onChange}
        step={step}
        type="range"
        value={value}
      />
      <ControlValue>{valueLabel}</ControlValue>
    </SliderLabel>
  );
}

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
      <Toggle>
        <ToggleInput checked={checked} onChange={onChange} type="checkbox" />
        <ToggleTrack />
      </Toggle>
    </ToggleRow>
  );
}
