import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { HomeStepperStepType } from '../../types/HomeStepperStep';

const ProgressBarContainer = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
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

const ProgressRail = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1)};
`;

const StepIndicatorRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${theme.spacing(3)};
  height: 80px;
`;

const PillBackground = styled.div`
  background-color: ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(8)};
  display: flex;
  height: 100%;
  overflow: hidden;
  width: ${theme.spacing(1)};
`;

const PillFill = styled.div`
  background-color: ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(8)};
  transition: height 0.4s ease;
  width: 100%;
`;

const ActiveLabel = styled.p`
  color: ${theme.colors.highlight[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  line-height: 16px;
  margin: 0;
  margin-top: -2px;
  text-transform: uppercase;
`;

const InactiveDotWrapper = styled.div`
  align-items: center;
  display: flex;
  height: 16px;
  justify-content: center;
  width: ${theme.spacing(1)};
`;

const InactiveDot = styled.div`
  background-color: ${theme.colors.primary.border[20]};
  border-radius: 50%;
  height: ${theme.spacing(1)};
  width: ${theme.spacing(1)};
`;

type ProgressBarProps = {
  activeStepIndex: number;
  scrollProgress: number;
  steps: HomeStepperStepType[];
};

export function ProgressBar({
  activeStepIndex,
  scrollProgress,
  steps,
}: ProgressBarProps) {
  const stepCount = steps.length;

  const localProgress = Math.min(
    1,
    Math.max(0, scrollProgress * stepCount - activeStepIndex),
  );
  const fillPercentage = localProgress * 100;

  return (
    <ProgressBarContainer>
      <StickyViewportCenter>
        <ProgressRail>
          {steps.map((_, index) =>
            index === activeStepIndex ? (
              <StepIndicatorRow key={`step-${index}`}>
                <PillBackground>
                  <PillFill style={{ height: `${fillPercentage}%` }} />
                </PillBackground>
                <ActiveLabel>{String(index + 1).padStart(2, '0')}</ActiveLabel>
              </StepIndicatorRow>
            ) : (
              <InactiveDotWrapper key={`step-${index}`}>
                <InactiveDot />
              </InactiveDotWrapper>
            ),
          )}
        </ProgressRail>
      </StickyViewportCenter>
    </ProgressBarContainer>
  );
}
