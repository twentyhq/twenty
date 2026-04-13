'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEventHandler,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

const TAB_LABEL_WIDTH = 72;

export const PanelShell = styled.aside<{ $collapsed?: boolean }>`
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
  height: ${(props) => (props.$collapsed ? 'auto' : '100%')};
  overflow: hidden;
  width: ${(props) =>
    props.$collapsed ? 'auto' : 'min(320px, calc(100vw - 32px))'};

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    height: ${(props) => (props.$collapsed ? 'auto' : '100%')};
    width: ${(props) => (props.$collapsed ? 'auto' : '100%')};
  }
`;

export const TabsBar = styled.div<{ $collapsed?: boolean }>`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  margin: 0;
  padding: ${(props) => (props.$collapsed ? '12px' : '12px 12px 0')};
`;

export const TabButton = styled.button<{ $active: boolean }>`
  background: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
  border: none;
  border-radius: 7px;
  color: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.52)'};
  cursor: pointer;
  font-family: ${theme.font.family.sans};
  font-size: 12px;
  font-weight: ${(props) => (props.$active ? 600 : 500)};
  letter-spacing: 0;
  line-height: 1;
  padding: 8px 10px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: ${(props) =>
      props.$active ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)'};
    color: ${(props) =>
      props.$active
        ? 'rgba(255, 255, 255, 0.94)'
        : 'rgba(255, 255, 255, 0.74)'};
  }

  &:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.35);
    outline-offset: 1px;
  }
`;

export const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

export const Section = styled.section<{ $first?: boolean }>`
  border-top: ${(props) =>
    props.$first ? 'none' : '1px solid rgba(255, 255, 255, 0.06)'};
  margin-top: ${(props) => (props.$first ? '0' : '14px')};
  padding-top: ${(props) => (props.$first ? '0' : '14px')};
`;

export const SectionTitle = styled.div<{ $preserveCase?: boolean }>`
  color: rgba(255, 255, 255, 0.36);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: ${(props) => (props.$preserveCase ? '0.02em' : '0.08em')};
  margin-bottom: 10px;
  text-transform: ${(props) => (props.$preserveCase ? 'none' : 'uppercase')};
`;

export const SectionHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  & > ${SectionTitle} {
    margin-bottom: 0;
  }
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
  align-items: center;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: ${TAB_LABEL_WIDTH}px minmax(0, 1fr);
`;

export const SegmentedLabel = styled.div`
  align-items: center;
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

const SegmentedGroup = styled.div`
  align-items: stretch;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  display: grid;
  gap: 1px;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  height: 24px;
  padding: 1px;
  width: 100%;
`;

const SegmentedButton = styled.button<{ $active: boolean }>`
  background: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.14)' : 'transparent'};
  border: none;
  border-radius: 6px;
  color: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.58)'};
  cursor: pointer;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  font-weight: ${(props) => (props.$active ? 600 : 500)};
  height: 100%;
  padding: 0 10px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.86);
  }

  &:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.35);
    outline-offset: 1px;
  }
`;

const EditableControlValueButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: text;
  font-family: inherit;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  min-width: 34px;
  padding: 0;
  text-align: right;

  &:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.25);
    outline-offset: 2px;
  }
`;

const EditableControlValueInput = styled.input`
  appearance: textfield;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.62);
  font-family: inherit;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  min-width: 34px;
  outline: none;
  padding: 0;
  text-align: right;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
  }
`;

export const SliderInput = styled.input`
  appearance: none;
  background: transparent;
  cursor: pointer;
  height: 16px;
  outline: none;
  transition: transform 0.2s ease;
  width: 100%;
  -webkit-tap-highlight-color: transparent;

  &::-webkit-slider-runnable-track {
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.35) var(--fill, 50%),
      rgba(255, 255, 255, 0.08) var(--fill, 50%)
    );
    border-radius: 999px;
    height: 6px;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    background: transparent;
    border: none;
    border-radius: 999px;
    height: 16px;
    margin-top: -5px;
    width: 16px;
  }

  &::-moz-range-progress {
    background: rgba(255, 255, 255, 0.35);
    border-radius: 999px;
    height: 6px;
  }

  &::-moz-range-thumb {
    background: transparent;
    border: none;
    border-radius: 999px;
    height: 16px;
    width: 16px;
  }

  &::-moz-range-track {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    height: 6px;
  }

  &:active {
    transform: scaleY(2);
  }
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
`;

export const ValueDisplay = styled.div`
  align-items: center;
  background-color: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  min-height: 31px;
  overflow: hidden;
  padding: 7px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
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

const LabelWithInfoRow = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 6px;
  min-width: 0;
`;

const InfoTooltipRoot = styled.span`
  display: inline-flex;
  position: relative;
`;

const InfoTooltipButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.32);
  cursor: help;
  display: inline-flex;
  height: 14px;
  justify-content: center;
  margin: 0;
  padding: 0;
  transition: color 0.15s ease;
  width: 14px;

  &:hover,
  &:focus-visible {
    color: rgba(255, 255, 255, 0.7);
    outline: none;
  }

  &:hover + span,
  &:focus-visible + span {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

const InfoTooltipBubble = styled.span`
  background: rgba(9, 9, 13, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.78);
  font-size: 10px;
  line-height: 1.45;
  max-width: 220px;
  padding: 8px 10px;
  pointer-events: none;
  position: fixed;
  width: max-content;
  z-index: 4;

  &::before {
    background: rgba(9, 9, 13, 0.96);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    content: '';
    height: 8px;
    left: 50%;
    position: absolute;
    top: -5px;
    transform: translateX(-50%) rotate(45deg);
    width: 8px;
  }
`;

export const Toggle = styled.label`
  display: block;
  flex-shrink: 0;
  height: 18px;
  position: relative;
  width: 28px;
`;

export const ToggleInput = styled.input`
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
    left: 2px;
    position: absolute;
    top: 3px;
    transition: transform 0.2s ease;
    width: 12px;
  }
`;

export const ColorControlRow = styled.div`
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: ${TAB_LABEL_WIDTH}px minmax(0, 1fr);
`;

export const ColorControlLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
`;

export const ColorPickerField = styled.div`
  align-items: center;
  cursor: text;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  justify-self: end;
  min-height: 16px;
  min-width: fit-content;
  padding: 0;
  position: relative;
  width: auto;
`;

export const ColorSwatch = styled.span`
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  height: 16px;
  width: 16px;
`;

export const ColorHexInput = styled.input`
  appearance: none;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-family: ${theme.font.family.mono};
  font-size: 11px;
  height: 16px;
  letter-spacing: 0.02em;
  line-height: 16px;
  min-width: 7ch;
  outline: none;
  padding: 0;
  text-align: right;
  text-transform: uppercase;
  width: 7ch;

  &::placeholder {
    color: rgba(255, 255, 255, 0.32);
  }
`;

export const ColorSwatchButton = styled.label`
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  position: relative;
`;

export const ColorInput = styled.input`
  appearance: none;
  border: none;
  cursor: pointer;
  height: 100%;
  inset: 0;
  outline: none;
  opacity: 0;
  padding: 0;
  position: absolute;
  width: 100%;
`;

function normalizeHexColor(value: string): string | null {
  const normalizedValue = value.trim().replace(/^#/, '');

  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalizedValue)) {
    return null;
  }

  return `#${normalizedValue.toUpperCase()}`;
}

type ColorFieldProps = {
  ariaLabel: string;
  onChange: (value: string) => void;
  value: string;
};

export function ColorField({ ariaLabel, onChange, value }: ColorFieldProps) {
  const normalizedValue = value.toUpperCase();
  const [draftValue, setDraftValue] = useState(normalizedValue);

  useEffect(() => {
    setDraftValue(normalizedValue);
  }, [normalizedValue]);

  const commitDraftValue = () => {
    const nextValue = normalizeHexColor(draftValue);

    if (!nextValue) {
      setDraftValue(normalizedValue);
      return;
    }

    setDraftValue(nextValue);

    if (nextValue !== normalizedValue) {
      onChange(nextValue);
    }
  };

  return (
    <ColorPickerField>
      <ColorHexInput
        aria-label={`${ariaLabel} hex value`}
        maxLength={7}
        onBlur={commitDraftValue}
        onClick={(event) => event.currentTarget.select()}
        onChange={(event) => setDraftValue(event.target.value.toUpperCase())}
        onFocus={(event) => event.currentTarget.select()}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            setDraftValue(normalizedValue);
            event.currentTarget.blur();
          }
        }}
        spellCheck={false}
        type="text"
        value={draftValue}
      />
      <ColorSwatchButton title={ariaLabel}>
        <ColorSwatch style={{ backgroundColor: normalizedValue }} />
        <ColorInput
          aria-label={ariaLabel}
          onChange={(event) => onChange(event.target.value)}
          type="color"
          value={value}
        />
      </ColorSwatchButton>
    </ColorPickerField>
  );
}

export const ShapeRow = styled.div`
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: ${TAB_LABEL_WIDTH}px minmax(0, 1fr) auto;
`;

export const UploadButton = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: 13px;
  height: 24px;
  justify-content: center;
  transition: all 0.15s ease;
  width: 24px;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.22);
    color: rgba(255, 255, 255, 0.8);
  }
`;

export const ExportNameInput = styled.input`
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  margin-bottom: 14px;
  outline: none;
  padding: 7px 10px;
  transition: border-color 0.15s ease;
  width: 100%;

  &:hover {
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    border-color: #4a38f5;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
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
  background: ${(props) =>
    props.$primary ? 'rgba(255, 255, 255, 0.24)' : 'rgba(255, 255, 255, 0.2)'};
  border: none;
  border-radius: 8px;
  color: ${(props) =>
    props.$primary ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.8)'};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  font-weight: ${theme.font.weight.medium};
  gap: 8px;
  justify-content: center;
  line-height: normal;
  margin-top: ${(props) => (props.$primary ? '0' : '8px')};
  padding: 7px 12px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
  width: 100%;

  &:hover {
    background: ${(props) =>
      props.$primary
        ? 'rgba(255, 255, 255, 0.28)'
        : 'rgba(255, 255, 255, 0.24)'};
    color: rgba(255, 255, 255, 0.92);
  }

  &:active {
    background: ${(props) =>
      props.$primary
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(255, 255, 255, 0.28)'};
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.36);
    outline-offset: 2px;
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.36);
    cursor: not-allowed;
    transform: none;
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

function getStepPrecision(step: number | undefined) {
  if (!step || Number.isInteger(step)) {
    return 0;
  }

  const stepString = step.toString().toLowerCase();

  if (stepString.includes('e-')) {
    const exponent = stepString.split('e-')[1];

    return exponent ? Number.parseInt(exponent, 10) : 0;
  }

  return stepString.split('.')[1]?.length ?? 0;
}

function formatEditableValue(value: number, step: number | undefined) {
  const precision = getStepPrecision(step);

  if (precision === 0) {
    return String(Math.round(value));
  }

  return String(Number(value.toFixed(precision)));
}

function clampAndSnapValue(
  value: number,
  min: number,
  max: number,
  step: number | undefined,
) {
  const clampedValue = Math.min(Math.max(value, min), max);

  if (!step || step <= 0) {
    return clampedValue;
  }

  const precision = getStepPrecision(step);
  const snappedValue = Math.round((clampedValue - min) / step) * step + min;

  return Number(Math.min(Math.max(snappedValue, min), max).toFixed(precision));
}

export function SliderControl({
  children,
  max,
  min,
  onChange,
  step,
  value,
  valueLabel,
}: SliderControlProps) {
  const [draftValue, setDraftValue] = useState<string | null>(null);
  const valueInputReference = useRef<HTMLInputElement>(null);
  const fillPercent = ((value - min) / (max - min)) * 100;
  const isEditing = draftValue !== null;

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    valueInputReference.current?.focus();
    valueInputReference.current?.select();
  }, [isEditing]);

  const commitDraftValue = () => {
    if (draftValue === null) {
      return;
    }

    const nextValue = Number.parseFloat(draftValue);
    setDraftValue(null);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    const normalizedValue = clampAndSnapValue(nextValue, min, max, step);

    onChange({
      target: { value: String(normalizedValue) },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <SliderLabel>
      <span>{children}</span>
      <SliderInput
        max={max}
        min={min}
        onChange={onChange}
        step={step}
        style={{ '--fill': `${fillPercent}%` } as React.CSSProperties}
        type="range"
        value={value}
      />
      {isEditing ? (
        <EditableControlValueInput
          inputMode="decimal"
          max={max}
          min={min}
          onBlur={commitDraftValue}
          onChange={(event) => setDraftValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitDraftValue();
              return;
            }

            if (event.key === 'Escape') {
              event.preventDefault();
              setDraftValue(null);
            }
          }}
          ref={valueInputReference}
          step={step}
          type="number"
          value={draftValue}
        />
      ) : (
        <EditableControlValueButton
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDraftValue(formatEditableValue(value, step));
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          type="button"
        >
          <ControlValue>{valueLabel}</ControlValue>
        </EditableControlValueButton>
      )}
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

type SegmentedControlProps = {
  children: ReactNode;
  onChange: (value: string) => void;
  value: string;
  options: Array<{ label: string; value: string }>;
};

export function SegmentedControl({
  children,
  onChange,
  options,
  value,
}: SegmentedControlProps) {
  return (
    <SegmentedLabel>
      <span>{children}</span>
      <SegmentedGroup
        aria-label={typeof children === 'string' ? children : undefined}
        role="radiogroup"
      >
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <SegmentedButton
              $active={isActive}
              aria-checked={isActive}
              key={option.value}
              onClick={() => {
                if (!isActive) {
                  onChange(option.value);
                }
              }}
              role="radio"
              type="button"
            >
              {option.label}
            </SegmentedButton>
          );
        })}
      </SegmentedGroup>
    </SegmentedLabel>
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

type LabelWithTooltipProps = {
  description: string;
  label: ReactNode;
};

export function LabelWithTooltip({
  description,
  label,
}: LabelWithTooltipProps) {
  const buttonReference = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    left: 0,
    top: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateTooltipPosition = () => {
      const button = buttonReference.current;

      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      setTooltipPosition({
        left: rect.left + rect.width / 2,
        top: rect.bottom + 12,
      });
    };

    updateTooltipPosition();

    window.addEventListener('resize', updateTooltipPosition);
    window.addEventListener('scroll', updateTooltipPosition, true);

    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
      window.removeEventListener('scroll', updateTooltipPosition, true);
    };
  }, [isOpen]);

  return (
    <LabelWithInfoRow>
      <span>{label}</span>
      <InfoTooltipRoot>
        <InfoTooltipButton
          aria-describedby={isOpen ? tooltipId : undefined}
          aria-label={description}
          onBlur={() => setIsOpen(false)}
          onFocus={() => setIsOpen(true)}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          ref={buttonReference}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="14"
          >
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
            <path d="M12 9h.01" />
            <path d="M11 12h1v4h1" />
          </svg>
        </InfoTooltipButton>
        {isMounted && isOpen
          ? createPortal(
              <InfoTooltipBubble
                id={tooltipId}
                role="tooltip"
                style={{
                  left: tooltipPosition.left,
                  top: tooltipPosition.top,
                  transform: 'translateX(-50%)',
                }}
              >
                {description}
              </InfoTooltipBubble>,
              document.body,
            )
          : null}
      </InfoTooltipRoot>
    </LabelWithInfoRow>
  );
}

type SectionToggleHeaderProps = {
  checked: boolean;
  children: ReactNode;
  onChange: ChangeEventHandler<HTMLInputElement>;
  preserveCase?: boolean;
};

export function SectionToggleHeader({
  checked,
  children,
  onChange,
  preserveCase,
}: SectionToggleHeaderProps) {
  return (
    <SectionHeader>
      <SectionTitle $preserveCase={preserveCase}>{children}</SectionTitle>
      <Toggle>
        <ToggleInput checked={checked} onChange={onChange} type="checkbox" />
        <ToggleTrack />
      </Toggle>
    </SectionHeader>
  );
}
