'use client';

import { styled } from '@linaria/react';
import {
  IconChecklist,
  IconCheck,
  IconFilter,
  IconHierarchy3,
  IconLayoutList,
  IconMail,
  IconNotes,
  IconSearch,
} from '@tabler/icons-react';

import { VISUAL_TOKENS } from '@/sections/AppPreview/Shared/utils/app-preview-tokens';

import type { AgentStep, AgentToolIcon } from './product-visual.data';

const TOOL_ICONS: Record<AgentToolIcon, typeof IconSearch> = {
  search: IconSearch,
  filter: IconFilter,
  notes: IconNotes,
  tasks: IconChecklist,
  record: IconLayoutList,
  workflow: IconHierarchy3,
  mail: IconMail,
};

const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StepRow = styled.div`
  align-items: flex-start;
  animation: aiStepAppear 240ms cubic-bezier(0.22, 1, 0.36, 1) both;
  display: flex;
  gap: 6px;
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

const StepIcon = styled.span`
  align-items: center;
  color: ${VISUAL_TOKENS.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  height: 18px;
`;

const Spinner = styled.span`
  align-items: center;
  animation: aiSpin 0.85s linear infinite;
  color: ${VISUAL_TOKENS.font.color.tertiary};
  display: flex;
  flex-shrink: 0;

  @keyframes aiSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ShimmerText = styled.span`
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: aiShimmer 1.1s linear infinite;
  background-clip: text;
  background-color: ${VISUAL_TOKENS.font.color.light};
  background-image: linear-gradient(
    90deg,
    ${VISUAL_TOKENS.font.color.light} 0%,
    ${VISUAL_TOKENS.font.color.primary} 50%,
    ${VISUAL_TOKENS.font.color.light} 100%
  );
  background-size: 200% 100%;
  color: ${VISUAL_TOKENS.font.color.light};
  font-family: ${VISUAL_TOKENS.font.family};
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;

  @keyframes aiShimmer {
    0% {
      background-position: 200% center;
    }
    100% {
      background-position: -200% center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const DoneText = styled.span`
  color: ${VISUAL_TOKENS.font.color.secondary};
  font-family: ${VISUAL_TOKENS.font.family};
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
`;

function ThinkingSpinner() {
  return (
    <Spinner>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle
          cx="7"
          cy="7"
          r="5.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="20 14"
        />
      </svg>
    </Spinner>
  );
}

type ProductVisualAiStepsProps = {
  activeStepIndex: number;
  completedStepCount: number;
  steps: AgentStep[];
};

export function ProductVisualAiSteps({
  activeStepIndex,
  completedStepCount,
  steps,
}: ProductVisualAiStepsProps) {
  const visibleCount =
    activeStepIndex >= 0 ? activeStepIndex + 1 : completedStepCount;
  const visibleSteps = steps.slice(0, visibleCount);

  return (
    <StepList>
      {visibleSteps.map((step, index) => {
        const isRunning = index === activeStepIndex;

        if (step.kind === 'thinking') {
          return (
            <StepRow key={`thinking-${index}`}>
              <StepIcon>
                {isRunning ? (
                  <ThinkingSpinner />
                ) : (
                  <IconCheck size={14} stroke={2} />
                )}
              </StepIcon>
              {isRunning ? (
                <ShimmerText>Thinking</ShimmerText>
              ) : (
                <DoneText>Thought</DoneText>
              )}
            </StepRow>
          );
        }

        const ToolIcon = TOOL_ICONS[step.icon];

        return (
          <StepRow key={`tool-${index}`}>
            <StepIcon>
              <ToolIcon size={14} stroke={1.8} />
            </StepIcon>
            {isRunning ? (
              <ShimmerText>{step.running}</ShimmerText>
            ) : (
              <DoneText>{step.done}</DoneText>
            )}
          </StepRow>
        );
      })}
    </StepList>
  );
}
