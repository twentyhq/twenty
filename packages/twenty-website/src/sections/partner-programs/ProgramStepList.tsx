'use client';

import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react';

import {
  clampProgress,
  useMediaQuery,
  usePrefersReducedMotion,
  useScheduledOnScroll,
} from '@/platform/motion';
import {
  BREAKPOINT_PX,
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body, Heading } from '@/ui';

// Viewport fractions the block's top travels between while the steps reveal:
// the walk starts as the block enters the screen and ends before it leaves.
const REVEAL_START_VIEWPORT_FRACTION = 0.7;
const REVEAL_END_VIEWPORT_FRACTION = 0.05;

const Track = styled.div`
  scroll-margin-top: ${spacing(24)};

  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    align-items: start;
    column-gap: ${spacing(10)};
    display: grid;
    grid-template-columns: ${spacing(85)} minmax(0, 1fr);

    & > * + * {
      margin-top: 0;
    }
  }
`;

const IntroColumn = styled.div`
  ${mediaUp('md')} {
    position: sticky;
    top: ${spacing(24)};
  }
`;

const StepColumn = styled.div`
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

// The list always holds its full height, so the page below never moves; the
// card drawn behind it and the footer under it follow the revealed steps.
const StepList = styled.ol`
  display: grid;
  isolation: isolate;
  list-style: none;
  padding: 0 ${spacing(5)};
  position: relative;

  ${mediaUp('md')} {
    grid-auto-rows: 1fr;
    padding: 0 ${spacing(8)};
  }
`;

const StepCard = styled.li`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  height: calc(100% + var(--reveal-offset, 0px));
  inset: 0 0 auto;
  position: absolute;
  transition: height ${DURATION.lg} ${EASING.standard};
  z-index: -1;

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

// Footer rows close the walk: each reveals in turn once every step has.
const FooterSlot = styled.div`
  ${mediaUp('md')} {
    opacity: 0;
    transform: translateY(${spacing(4)});
    transition:
      opacity ${DURATION.lg} ${EASING.gentle},
      transform ${DURATION.lg} ${EASING.standard};

    &[data-reached] {
      opacity: 1;
      transform: none;
    }
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const StepItem = styled.li`
  ${mediaUp('md')} {
    opacity: 0;
    transform: translateY(${spacing(4)});
    transition:
      opacity ${DURATION.lg} ${EASING.gentle},
      transform ${DURATION.lg} ${EASING.standard};

    &[data-reached] {
      opacity: 1;
      transform: none;
    }
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const StepRow = styled.div`
  display: grid;
  grid-template-columns: ${spacing(10)} minmax(0, 1fr);

  ${mediaUp('md')} {
    grid-template-columns: ${spacing(16)} minmax(0, 1fr);
  }
`;

const StepRailColumn = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  padding-top: ${spacing(8)};
`;

// The number sits on the step title's line box so the two share a baseline row.
const StepNumber = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  ${typeRampDeclarations('headingXs')}
  align-items: center;
  display: flex;
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};

  ${mediaUp('md')} {
    color: ${color('blue')};
  }
`;

const StepRail = styled.span`
  background-color: ${semanticColor.line};
  flex: 1;
  margin-block: ${spacing(3)};
  margin-left: ${spacing(2)};
  width: 1px;
`;

const StepRailFill = styled.span`
  display: none;

  ${mediaUp('md')} {
    background-color: ${color('blue')};
    display: block;
    height: var(--rail-fill, 0%);
    width: 100%;
  }
`;

const StepContent = styled.div`
  padding-block: ${spacing(8)} ${spacing(10)};

  &[data-divided] {
    border-top: 1px dotted ${semanticColor.divider};
  }

  & > * + * {
    margin-top: ${spacing(2)};
  }

  ${mediaUp('md')} {
    padding-block: ${spacing(8)} ${spacing(16)};
  }

  ${mediaUp('lg')} {
    column-gap: ${spacing(10)};
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    & > * + * {
      margin-top: 0;
    }
  }
`;

export type ProgramFooterRow = {
  id: string;
  node: ReactNode;
};

export type ProgramStepListItem = {
  title: string;
  body: string;
  // Replaces the step number: a row that belongs to the list without being a step.
  marker?: ReactNode;
};

type ProgramStepListProps = {
  anchorId: string;
  intro: ReactNode;
  steps: readonly ProgramStepListItem[];
  footerRows?: readonly ProgramFooterRow[];
};

export function ProgramStepList({
  anchorId,
  intro,
  steps,
  footerRows = [],
}: ProgramStepListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMdUp = useMediaQuery(`(min-width: ${BREAKPOINT_PX.md}px)`);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isScrollDriven = isMdUp && !prefersReducedMotion;
  const listRef = useRef<HTMLOListElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [revealOffsetPx, setRevealOffsetPx] = useState(0);
  const stepCount = steps.length;
  const stageCount = stepCount + footerRows.length;
  const updateScrollProgress = useCallback(() => {
    const element = scrollContainerRef.current;
    const list = listRef.current;
    if (element === null || list === null) return;

    const start = window.innerHeight * REVEAL_START_VIEWPORT_FRACTION;
    const end = window.innerHeight * REVEAL_END_VIEWPORT_FRACTION;
    const progress = clampProgress(
      (start - element.getBoundingClientRect().top) / (start - end),
    );
    const stepItems = list.querySelectorAll<HTMLElement>('[data-step]');
    const firstHiddenStep = stepItems[Math.floor(progress * stageCount) + 1];

    setScrollProgress(progress);
    setRevealOffsetPx(
      firstHiddenStep === undefined
        ? 0
        : firstHiddenStep.offsetTop - list.offsetHeight,
    );
  }, [stageCount]);

  useScheduledOnScroll(updateScrollProgress, { enabled: isScrollDriven });

  const stepProgress = isScrollDriven
    ? scrollProgress * stageCount
    : stageCount;
  const revealOffsetStyle = {
    '--reveal-offset': `${isScrollDriven ? revealOffsetPx : 0}px`,
  } as CSSProperties;

  return (
    <Track id={anchorId} ref={scrollContainerRef}>
      <IntroColumn>{intro}</IntroColumn>
      <StepColumn>
        <StepList ref={listRef}>
          <StepCard aria-hidden role="presentation" style={revealOffsetStyle} />
          {steps.map((step, stepIndex) => {
            const isReached = stepProgress >= stepIndex;
            const railFill = Math.min(1, Math.max(0, stepProgress - stepIndex));

            return (
              <StepItem
                data-reached={isReached ? '' : undefined}
                data-step=""
                key={step.title}
              >
                <StepRow>
                  <StepRailColumn aria-hidden>
                    <StepNumber>
                      {isDefined(step.marker)
                        ? step.marker
                        : String(stepIndex + 1).padStart(2, '0')}
                    </StepNumber>
                    {stepIndex < steps.length - 1 && (
                      <StepRail>
                        <StepRailFill
                          style={
                            {
                              '--rail-fill': `${railFill * 100}%`,
                            } as CSSProperties
                          }
                        />
                      </StepRail>
                    )}
                  </StepRailColumn>
                  <StepContent data-divided={stepIndex > 0 ? '' : undefined}>
                    <Heading as="h3" family="sans" size="xs" weight="medium">
                      {step.title}
                    </Heading>
                    <Body muted size="sm">
                      {step.body}
                    </Body>
                  </StepContent>
                </StepRow>
              </StepItem>
            );
          })}
        </StepList>
        {footerRows.map((footerRow, footerRowIndex) => (
          <FooterSlot
            data-reached={
              stepProgress >= stepCount + footerRowIndex ? '' : undefined
            }
            key={footerRow.id}
          >
            {footerRow.node}
          </FooterSlot>
        ))}
      </StepColumn>
    </Track>
  );
}
