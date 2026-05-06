import { theme } from '@/theme';
import { styled } from '@linaria/react';

const RailContainer = styled.div`
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

const Rail = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
`;

const StepRow = styled.div`
  align-items: center;
  display: flex;
  height: 16px;
  justify-content: center;
  position: relative;
  transition: height 0.4s ease;
  width: ${theme.spacing(1)};

  &[data-active='true'] {
    height: 80px;
  }
`;

const PillTrack = styled.div`
  border-radius: 50%;
  display: flex;
  height: ${theme.spacing(1)};
  overflow: hidden;
  transition:
    height 0.4s ease,
    border-radius 0.4s ease;
  width: ${theme.spacing(1)};

  &[data-active='true'] {
    border-radius: ${theme.radius(8)};
    height: 100%;
  }
`;

const PillFill = styled.div`
  background-color: ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(8)};
  transition: height 0.15s linear;
  width: 100%;
`;

const StepLabel = styled.div`
  color: ${theme.colors.highlight[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: 700;
  left: calc(100% + ${theme.spacing(4)});
  line-height: 16px;
  opacity: 0;
  position: absolute;
  text-transform: uppercase;
  top: 0;
  transition: opacity 0.3s ease;
  white-space: nowrap;

  &[data-visible='true'] {
    opacity: 1;
  }
`;

type StepperProgressRailProps = {
  activeStepIndex: number;
  inactiveColor?: string;
  localProgress: number;
  stepCount: number;
};

export function StepperProgressRail({
  activeStepIndex,
  inactiveColor = theme.colors.primary.border[20],
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
              <StepRow data-active={String(isActive)} key={`step-${index}`}>
                <PillTrack
                  data-active={String(isActive)}
                  style={{ backgroundColor: inactiveColor }}
                >
                  <PillFill style={{ height: `${fillPercentage}%` }} />
                </PillTrack>
                <StepLabel data-visible={String(isActive)}>
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
