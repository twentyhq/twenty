'use client';

import { observeElementsSize } from '@/lib/dom/observe-element-size';
import type { PlansBillingPeriod } from '@/sections/Plans/types';
import { theme } from '@/theme';
import { Trans } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useLayoutEffect, useRef, useState } from 'react';

const ToggleTrack = styled.div`
  align-items: center;
  background-color: ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(20)};
  display: inline-flex;
  overflow: hidden;
  padding: 2px;
  position: relative;
`;

const ToggleHighlight = styled.div`
  background-color: ${theme.colors.primary.background[100]};
  border-radius: ${theme.radius(8)};
  bottom: 2px;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 2px;
  transition:
    transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1),
    width 0.24s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.18s ease;
  will-change: transform, width;
`;

const ToggleOption = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${theme.radius(8)};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  column-gap: ${theme.spacing(2)};
  height: 28px;
  justify-content: center;
  line-height: ${theme.lineHeight(4)};
  padding-left: ${theme.spacing(3)};
  position: relative;
  transition: color 0.18s ease;
  white-space: nowrap;
  z-index: 1;

  &[data-period='monthly'] {
    padding-right: ${theme.spacing(3)};
  }

  &[data-period='yearly'] {
    padding-right: ${theme.spacing(0.5)};
  }

  &[data-active='true'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-active='false'] {
    color: ${theme.colors.primary.text[60]};
  }
`;

const ToggleLabel = styled.span`
  display: inline-flex;
  justify-content: center;
`;

const DiscountBadge = styled.span`
  background-color: ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(12)};
  color: ${theme.colors.secondary.text[100]};
  display: inline-flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(2.5)};
  font-weight: ${theme.font.weight.medium};
  height: 24px;
  align-items: center;
  justify-content: center;
  line-height: ${theme.lineHeight(3.5)};
  padding-left: ${theme.spacing(1.5)};
  padding-right: ${theme.spacing(1.5)};
`;

type BillingToggleProps = {
  billing: PlansBillingPeriod;
  onBillingChange: (billing: PlansBillingPeriod) => void;
};

type ToggleHighlightState = {
  ready: boolean;
  width: number;
  x: number;
};

export function BillingToggle({
  billing,
  onBillingChange,
}: BillingToggleProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const monthlyButtonRef = useRef<HTMLButtonElement>(null);
  const yearlyButtonRef = useRef<HTMLButtonElement>(null);
  const [highlight, setHighlight] = useState<ToggleHighlightState>({
    ready: false,
    width: 0,
    x: 0,
  });

  useLayoutEffect(() => {
    const track = trackRef.current;
    const monthlyButton = monthlyButtonRef.current;
    const yearlyButton = yearlyButtonRef.current;

    if (!track || !monthlyButton || !yearlyButton) {
      return;
    }

    const syncHighlight = () => {
      const activeButton = billing === 'monthly' ? monthlyButton : yearlyButton;
      const trackRect = track.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      const nextHighlight = {
        ready: true,
        width: buttonRect.width,
        x: buttonRect.left - trackRect.left,
      };

      setHighlight((currentHighlight) => {
        if (
          currentHighlight.ready === nextHighlight.ready &&
          currentHighlight.width === nextHighlight.width &&
          currentHighlight.x === nextHighlight.x
        ) {
          return currentHighlight;
        }

        return nextHighlight;
      });
    };

    syncHighlight();

    const stopObservingSize = observeElementsSize(
      [track, monthlyButton, yearlyButton],
      syncHighlight,
    );

    return () => {
      stopObservingSize();
    };
  }, [billing]);

  return (
    <ToggleTrack ref={trackRef} role="radiogroup" aria-label="Billing period">
      <ToggleHighlight
        aria-hidden="true"
        style={{
          opacity: highlight.ready ? 1 : 0,
          transform: `translateX(${highlight.x}px)`,
          width: `${highlight.width}px`,
        }}
      />
      <ToggleOption
        aria-checked={billing === 'monthly'}
        data-active={billing === 'monthly'}
        data-period="monthly"
        onClick={() => onBillingChange('monthly')}
        ref={monthlyButtonRef}
        role="radio"
        type="button"
      >
        <ToggleLabel>
          <Trans>Monthly</Trans>
        </ToggleLabel>
      </ToggleOption>
      <ToggleOption
        aria-checked={billing === 'yearly'}
        data-active={billing === 'yearly'}
        data-period="yearly"
        onClick={() => onBillingChange('yearly')}
        ref={yearlyButtonRef}
        role="radio"
        type="button"
      >
        <ToggleLabel>
          <Trans>Yearly</Trans>
        </ToggleLabel>
        <DiscountBadge>-25%</DiscountBadge>
      </ToggleOption>
    </ToggleTrack>
  );
}
