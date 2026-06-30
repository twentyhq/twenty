'use client';

import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';
import {
  IconChecklist,
  IconChevronRight,
  IconCpu,
  IconFilter,
  IconHierarchy3,
  IconLayoutList,
  IconMail,
  IconNotes,
  IconSearch,
} from '@tabler/icons-react';
import { useState } from 'react';

import { EASING } from '@/tokens';

import { type AgentStep, type AgentToolIcon } from './product-visual-scenes';

const TOOL_ICONS: Record<AgentToolIcon, typeof IconSearch> = {
  search: IconSearch,
  filter: IconFilter,
  notes: IconNotes,
  tasks: IconChecklist,
  record: IconLayoutList,
  workflow: IconHierarchy3,
  mail: IconMail,
};

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StepRow = styled.div`
  align-items: center;
  animation: aiStepAppear 240ms ${EASING.standard} both;
  display: flex;
  gap: 8px;
  min-height: 20px;

  @keyframes aiStepAppear {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SummaryButton = styled.button`
  align-items: center;
  animation: aiSummaryAppear 240ms ${EASING.standard} both;
  background: none;
  border: none;
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-family: var(--font-product), sans-serif;
  gap: 8px;
  min-height: 18px;
  padding: 0;
  width: fit-content;

  @keyframes aiSummaryAppear {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SummaryChevron = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.light};
  display: flex;
  justify-content: center;
  transition: transform 150ms ease-in-out;
`;

const SummaryText = styled.span`
  color: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
`;

const StepIcon = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.light};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  min-width: 14px;
`;

const StepLoaderIcon = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  min-width: 14px;
`;

const StepLabel = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-family: var(--font-product), sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
`;

function ThinkingOrbitLoader() {
  return (
    <StepLoaderIcon>
      <svg
        aria-hidden="true"
        focusable="false"
        height="14"
        viewBox="0 0 14 14"
        width="14"
      >
        <path
          d="M3.1 7 C3.1 4.4 6.0 4.4 7.0 7 C8.0 9.6 10.9 9.6 10.9 7 C10.9 4.4 8.0 4.4 7.0 7 C6.0 9.6 3.1 9.6 3.1 7"
          fill="none"
          pathLength={100}
          shapeRendering="geometricPrecision"
          stroke="currentColor"
          strokeDasharray="14 86"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        >
          <animate
            attributeName="stroke-dashoffset"
            dur="1.05s"
            repeatCount="indefinite"
            values="0;-100"
          />
          <animate
            attributeName="stroke-dasharray"
            dur="1.05s"
            repeatCount="indefinite"
            values="10 90;16 84;10 90"
          />
        </path>
      </svg>
    </StepLoaderIcon>
  );
}

// The agent preamble: rows appear as steps run, then collapse behind an
// "N steps" toggle once the answer starts streaming.
export function AiSteps({
  activeStepIndex,
  answerStarted,
  completedStepCount,
  steps,
}: {
  activeStepIndex: number;
  answerStarted: boolean;
  completedStepCount: number;
  steps: AgentStep[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isThinking = activeStepIndex >= 0;
  const shouldKeepExpandedBeforeAnswer = !answerStarted;
  const shouldShowSummaryButton =
    !isThinking && !shouldKeepExpandedBeforeAnswer;
  const shouldRenderRows =
    isThinking || isExpanded || shouldKeepExpandedBeforeAnswer;

  const stepCount = steps.length;
  const visibleCount =
    activeStepIndex >= 0 ? activeStepIndex + 1 : completedStepCount;
  // Steps run in authored order: position is identity.
  const visibleSteps = steps
    .slice(0, visibleCount)
    .map((step, stepNumber) => ({ step, stepNumber }));

  return (
    <StepsContainer>
      {shouldShowSummaryButton ? (
        <SummaryButton
          aria-expanded={isExpanded}
          type="button"
          onClick={() => setIsExpanded((previousValue) => !previousValue)}
        >
          <SummaryChevron
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <IconChevronRight size={14} stroke={2} />
          </SummaryChevron>
          <SummaryText>
            {stepCount === 1 ? '1 step' : `${stepCount} steps`}
          </SummaryText>
        </SummaryButton>
      ) : null}

      {shouldRenderRows ? (
        <StepList>
          {visibleSteps.map(({ step, stepNumber }) => {
            const isRunning = stepNumber === activeStepIndex;

            if (step.kind === 'thinking') {
              return (
                <StepRow key={`thinking-${stepNumber}`}>
                  {isRunning ? (
                    <ThinkingOrbitLoader />
                  ) : (
                    <StepIcon>
                      <IconCpu size={14} stroke={2} />
                    </StepIcon>
                  )}
                  <StepLabel>{isRunning ? 'Thinking' : 'Thought'}</StepLabel>
                </StepRow>
              );
            }

            const ToolIcon = TOOL_ICONS[step.icon];

            return (
              <StepRow key={`tool-${stepNumber}`}>
                <StepIcon>
                  <ToolIcon size={14} stroke={1.8} />
                </StepIcon>
                <StepLabel>{isRunning ? step.running : step.done}</StepLabel>
              </StepRow>
            );
          })}
        </StepList>
      ) : null}
    </StepsContainer>
  );
}
