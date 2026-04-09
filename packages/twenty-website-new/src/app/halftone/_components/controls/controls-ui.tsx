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
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  margin: 16px 16px 0;
  padding: 3px;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  background: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.38)'};
  cursor: pointer;
  flex: 1;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 6px 0;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) =>
      props.$active ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
    color: ${(props) =>
      props.$active ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.55)'};
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
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.35) var(--fill, 50%),
    rgba(255, 255, 255, 0.08) var(--fill, 50%)
  );
  border-radius: 999px;
  cursor: pointer;
  height: 6px;
  outline: none;
  transition: transform 0.2s ease;
  width: 100%;

  &::-webkit-slider-thumb {
    appearance: none;
    background: transparent;
    border: none;
    height: 6px;
    width: 0;
  }

  &::-moz-range-thumb {
    background: transparent;
    border: none;
    height: 0;
    width: 0;
  }

  &::-moz-range-track {
    background: transparent;
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
  outline: none;
  padding: 7px 34px 7px 10px;
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
    background: #4A38F5;
  }

  &:checked + span::after {
    transform: translateX(10px);
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
    height: 14px;
    left: 2px;
    position: absolute;
    top: 2px;
    transition: transform 0.2s ease;
    width: 14px;
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

export const ColorSwatch = styled.div`
  border-radius: 8px;
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.08);
  cursor: pointer;
  height: 24px;
  justify-self: end;
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.15s ease;
  width: 44px;

  &:hover {
    box-shadow:
      inset 0 1px 2px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.2);
  }
`;

export const ColorInput = styled.input`
  border: none;
  cursor: pointer;
  height: 150%;
  left: -10%;
  outline: none;
  padding: 0;
  position: absolute;
  top: -25%;
  width: 120%;
`;

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
  height: 32px;
  justify-content: center;
  transition: all 0.15s ease;
  width: 32px;

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
    border-color: #4A38F5;
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
  const fillPercent = ((value - min) / (max - min)) * 100;

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
