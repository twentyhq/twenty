'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';

import { TAB_LABEL_WIDTH } from './controls-form-constants';

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
  const escapePressedReference = useRef(false);

  useEffect(() => {
    setDraftValue(normalizedValue);
  }, [normalizedValue]);

  const commitDraftValue = () => {
    if (escapePressedReference.current) {
      escapePressedReference.current = false;
      return;
    }

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
            escapePressedReference.current = true;
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
