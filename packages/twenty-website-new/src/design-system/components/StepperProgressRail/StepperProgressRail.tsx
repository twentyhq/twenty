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

const StepIndicatorRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${theme.spacing(4)};
  height: 80px;
`;

const PillFill = styled.div`
  background-color: ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(8)};
  transition: height 0.1s linear;
  width: 100%;
`;

const ActiveLabel = styled.p`
  color: ${theme.colors.highlight[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: 700;
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

type StepperProgressRailProps = {
  activeStepIndex: number;
  inactiveColor?: string;
  scrollProgress: number;
  stepCount: number;
};

export function StepperProgressRail({
  activeStepIndex,
  inactiveColor = theme.colors.primary.border[20],
  scrollProgress,
  stepCount,
}: StepperProgressRailProps) {
  const globalProgress = scrollProgress * (stepCount - 1);

  return (
    <RailContainer>
      <StickyViewportCenter>
        <Rail>
          {Array.from({ length: stepCount }, (_, index) => {
            if (index === activeStepIndex) {
              const localProgress = globalProgress - index;
              const fillPercentage = Math.min(
                100,
                Math.max(0, localProgress * 100 * 1.5),
              );

              return (
                <StepIndicatorRow key={`step-${index}`}>
                  <div
                    style={{
                      backgroundColor: inactiveColor,
                      borderRadius: theme.radius(8),
                      display: 'flex',
                      height: '100%',
                      overflow: 'hidden',
                      width: theme.spacing(1),
                    }}
                  >
                    <PillFill style={{ height: `${fillPercentage}%` }} />
                  </div>
                  <ActiveLabel>
                    {String(index + 1).padStart(2, '0')}
                  </ActiveLabel>
                </StepIndicatorRow>
              );
            }

            return (
              <InactiveDotWrapper key={`step-${index}`}>
                <div
                  style={{
                    backgroundColor: inactiveColor,
                    borderRadius: '50%',
                    height: theme.spacing(1),
                    width: theme.spacing(1),
                  }}
                />
              </InactiveDotWrapper>
            );
          })}
        </Rail>
      </StickyViewportCenter>
    </RailContainer>
  );
}
