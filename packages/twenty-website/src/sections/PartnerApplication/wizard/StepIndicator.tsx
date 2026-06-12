'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';

const Track = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(2)};
`;

const Dot = styled.span`
  background: ${theme.colors.secondary.border[20]};
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  transition: background 0.2s ease;
  width: 8px;

  &[data-state='active'],
  &[data-state='completed'] {
    background: ${theme.colors.highlight[100]};
  }

  &[data-state='active'] {
    transform: scale(1.25);
  }
`;

const Connector = styled.span`
  background: ${theme.colors.secondary.border[20]};
  display: inline-block;
  flex: 1 1 auto;
  height: 1px;
  max-width: 32px;

  &[data-completed='true'] {
    background: ${theme.colors.highlight[100]};
  }
`;

type StepIndicatorProps = {
  stepCount: number;
  activeStepIndex: number;
};

export function StepIndicator({
  stepCount,
  activeStepIndex,
}: StepIndicatorProps) {
  return (
    <Track
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={stepCount}
      aria-valuenow={activeStepIndex + 1}
    >
      {Array.from({ length: stepCount }).map((_, index) => {
        const state =
          index < activeStepIndex
            ? 'completed'
            : index === activeStepIndex
              ? 'active'
              : 'upcoming';
        const isLast = index === stepCount - 1;
        return (
          <span
            key={index}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Dot data-state={state} />
            {isLast ? null : (
              <Connector
                data-completed={index < activeStepIndex ? 'true' : undefined}
              />
            )}
          </span>
        );
      })}
    </Track>
  );
}
