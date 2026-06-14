'use client';

import { styled } from '@linaria/react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { TooltipPositionEffect } from './effect-components/TooltipPositionEffect';

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

  return (
    <LabelWithInfoRow>
      <TooltipPositionEffect
        buttonRef={buttonReference}
        isOpen={isOpen}
        setTooltipPosition={setTooltipPosition}
      />
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
