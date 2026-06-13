'use client';

import { useLingui } from '@lingui/react';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useLayoutEffect, useRef, useState } from 'react';

import { observeElementSize } from '@/platform/motion';
import {
  color,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  REDUCED_MOTION,
  spacing,
} from '@/tokens';

import { type PlansBillingPeriod } from './plans-data';

const ToggleTrack = styled.div`
  align-items: center;
  background-color: ${color('black-10')};
  border-radius: ${radius(20)};
  display: inline-flex;
  overflow: hidden;
  padding: 2px;
  position: relative;
`;

const ToggleHighlight = styled.div`
  background-color: ${color('white')};
  border-radius: ${radius(8)};
  bottom: 2px;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 2px;
  transition:
    transform 0.24s ${EASING.spring},
    width 0.24s ${EASING.spring},
    opacity 0.18s ease;
  will-change: transform, width;

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const ToggleOption = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${radius(8)};
  column-gap: ${spacing(2)};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  height: 28px;
  justify-content: center;
  line-height: 1.35;
  padding-left: ${spacing(3)};
  position: relative;
  transition: color 0.18s ease;
  white-space: nowrap;
  z-index: 1;

  &[data-period='monthly'] {
    padding-right: ${spacing(3)};
  }

  &[data-period='yearly'] {
    padding-right: ${spacing(0.5)};
  }

  color: ${color('black-60')};

  &[data-active] {
    color: ${color('black')};
  }
`;

const DiscountBadge = styled.span`
  align-items: center;
  background-color: ${color('blue')};
  border-radius: ${radius(12)};
  color: ${color('white')};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(2.5)};
  font-weight: ${FONT_WEIGHT.medium};
  height: 24px;
  justify-content: center;
  padding-inline: ${spacing(1.5)};
`;

type HighlightState = {
  ready: boolean;
  width: number;
  x: number;
};

// The active option carries a white pill that glides between the two
// buttons; its geometry is measured, so locale-length labels just work.
export function BillingToggle({
  billing,
  onBillingChange,
}: {
  billing: PlansBillingPeriod;
  onBillingChange: (billing: PlansBillingPeriod) => void;
}) {
  const { i18n } = useLingui();
  const trackRef = useRef<HTMLDivElement>(null);
  const monthlyRef = useRef<HTMLButtonElement>(null);
  const yearlyRef = useRef<HTMLButtonElement>(null);
  const [highlight, setHighlight] = useState<HighlightState>({
    ready: false,
    width: 0,
    x: 0,
  });

  useLayoutEffect(() => {
    const track = trackRef.current;
    const monthlyButton = monthlyRef.current;
    const yearlyButton = yearlyRef.current;

    if (!track || !monthlyButton || !yearlyButton) {
      return undefined;
    }

    const syncHighlight = () => {
      const activeButton = billing === 'monthly' ? monthlyButton : yearlyButton;
      const trackRect = track.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      const next = {
        ready: true,
        width: buttonRect.width,
        x: buttonRect.left - trackRect.left,
      };
      setHighlight((current) =>
        current.ready === next.ready &&
        current.width === next.width &&
        current.x === next.x
          ? current
          : next,
      );
    };

    syncHighlight();
    const stops = [track, monthlyButton, yearlyButton].map((element) =>
      observeElementSize(element, syncHighlight),
    );
    return () => {
      for (const stop of stops) stop();
    };
  }, [billing]);

  return (
    <ToggleTrack
      aria-label={i18n._(msg`Billing period`)}
      ref={trackRef}
      role="radiogroup"
    >
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
        data-active={billing === 'monthly' ? '' : undefined}
        data-period="monthly"
        onClick={() => onBillingChange('monthly')}
        ref={monthlyRef}
        role="radio"
        type="button"
      >
        {i18n._(msg`Monthly`)}
      </ToggleOption>
      <ToggleOption
        aria-checked={billing === 'yearly'}
        data-active={billing === 'yearly' ? '' : undefined}
        data-period="yearly"
        onClick={() => onBillingChange('yearly')}
        ref={yearlyRef}
        role="radio"
        type="button"
      >
        {i18n._(msg`Yearly`)}
        <DiscountBadge>-25%</DiscountBadge>
      </ToggleOption>
    </ToggleTrack>
  );
}
