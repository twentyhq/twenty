'use client';

import { styled } from '@linaria/react';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEventHandler,
  type ReactNode,
} from 'react';

import { TAB_LABEL_WIDTH } from './controls-form-constants';

export const SliderLabel = styled.label`
  align-items: center;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: ${TAB_LABEL_WIDTH}px minmax(0, 1fr) auto;
`;

export const ControlValue = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  min-width: 34px;
  text-align: right;
`;

export const SliderInput = styled.input<{ $fillPercent: number }>`
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
      rgba(255, 255, 255, 0.35) ${({ $fillPercent }) => $fillPercent}%,
      rgba(255, 255, 255, 0.08) ${({ $fillPercent }) => $fillPercent}%
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

    const trimmed = draftValue.trim();
    setDraftValue(null);

    if (trimmed === '') {
      return;
    }

    const nextValue = Number(trimmed);

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
        $fillPercent={fillPercent}
        max={max}
        min={min}
        onChange={onChange}
        step={step}
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
