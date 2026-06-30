import { styled } from '@linaria/react';

import { color, DURATION, semanticColor, spacing } from '@/tokens';

const Track = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(2)};
`;

const Segment = styled.span`
  align-items: center;
  column-gap: ${spacing(2)};
  display: inline-flex;
`;

const Dot = styled.span`
  background: ${semanticColor.lineStrong};
  border-radius: 50%;
  height: 8px;
  transition: background ${DURATION.sm} ease;
  width: 8px;

  &[data-state='active'],
  &[data-state='completed'] {
    background: ${color('blue')};
  }

  &[data-state='active'] {
    transform: scale(1.25);
  }
`;

const Connector = styled.span`
  background: ${semanticColor.lineStrong};
  flex: 1 1 auto;
  height: 1px;
  max-width: 32px;

  &[data-completed] {
    background: ${color('blue')};
  }
`;

// A row of dots tracking progress through a fixed sequence of steps. Generic:
// the consumer passes how many steps there are and which is active.
export function StepIndicator({
  activeStepIndex,
  stepCount,
}: {
  activeStepIndex: number;
  stepCount: number;
}) {
  const stepNumbers = Array.from(
    { length: stepCount },
    (_unused, index) => index + 1,
  );

  return (
    <Track
      aria-valuemax={stepCount}
      aria-valuemin={1}
      aria-valuenow={activeStepIndex + 1}
      role="progressbar"
    >
      {stepNumbers.map((stepNumber) => {
        const dotIndex = stepNumber - 1;
        const state =
          dotIndex < activeStepIndex
            ? 'completed'
            : dotIndex === activeStepIndex
              ? 'active'
              : 'upcoming';
        return (
          <Segment key={`step-${stepNumber}`}>
            <Dot data-state={state} />
            {stepNumber === stepCount ? null : (
              <Connector
                data-completed={dotIndex < activeStepIndex ? '' : undefined}
              />
            )}
          </Segment>
        );
      })}
    </Track>
  );
}
