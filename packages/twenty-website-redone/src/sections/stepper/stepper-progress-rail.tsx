'use client';

import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  spacing,
} from '@/tokens';

const RailContainer = styled.div`
  display: none;

  ${mediaUp('md')} {
    align-items: flex-start;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
`;

const StickyViewportCenter = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: 100vh;
  justify-content: flex-start;
  max-height: 100vh;
  position: sticky;
  top: 0;
`;

const Rail = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
`;

const StepRow = styled.div`
  align-items: center;
  display: flex;
  height: 16px;
  justify-content: center;
  position: relative;
  transition: height 0.4s ease;
  width: ${spacing(1)};

  &[data-active] {
    height: 80px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const PillTrack = styled.div`
  background-color: ${color('black-20')};
  border-radius: 50%;
  display: flex;
  height: ${spacing(1)};
  overflow: hidden;
  transition:
    height 0.4s ease,
    border-radius 0.4s ease;
  width: ${spacing(1)};

  &[data-active] {
    border-radius: ${radius(8)};
    height: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// Fill height rides a CSS variable, so the only inline style is a custom
// property; the first render is deterministic (0%) on server and client.
const PillFill = styled.div`
  background-color: ${color('blue')};
  border-radius: ${radius(8)};
  height: var(--rail-fill, 0%);
  transition: height 0.15s linear;
  width: 100%;
`;

const StepLabel = styled.div`
  color: ${color('blue')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  left: calc(100% + ${spacing(4)});
  line-height: 16px;
  opacity: 0;
  position: absolute;
  text-transform: uppercase;
  top: 0;
  transition: opacity 0.3s ease;
  white-space: nowrap;

  &[data-visible] {
    opacity: 1;
  }
`;

export type StepperProgressRailProps = {
  activeStepIndex: number;
  localProgress: number;
  stepCount: number;
};

export function StepperProgressRail({
  activeStepIndex,
  localProgress,
  stepCount,
}: StepperProgressRailProps) {
  return (
    <RailContainer>
      <StickyViewportCenter>
        <Rail>
          {Array.from({ length: stepCount }, (_, index) => {
            const isActive = index === activeStepIndex;
            const fillPercentage = isActive
              ? Math.min(100, Math.max(0, localProgress * 100))
              : 0;
            return (
              <StepRow
                data-active={isActive ? '' : undefined}
                key={`step-${index}`}
              >
                <PillTrack data-active={isActive ? '' : undefined}>
                  <PillFill
                    style={
                      { '--rail-fill': `${fillPercentage}%` } as CSSProperties
                    }
                  />
                </PillTrack>
                <StepLabel data-visible={isActive ? '' : undefined}>
                  {String(index + 1).padStart(2, '0')}
                </StepLabel>
              </StepRow>
            );
          })}
        </Rail>
      </StickyViewportCenter>
    </RailContainer>
  );
}
