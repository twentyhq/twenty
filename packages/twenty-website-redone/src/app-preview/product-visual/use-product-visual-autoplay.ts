'use client';

import { useEffect, useState } from 'react';

import { displayPage } from './display-page';
import { PRODUCT_VISUAL_SCENES } from './product-visual-scenes';
import { streamedMarkdown } from './streamed-markdown';
import { useAppPreviewExperience } from '../shell/use-app-preview-experience';
import { useTimeoutRegistry } from '../stage/use-timeout-registry';
import { type AppPreviewConfig } from '../types';

const STREAM_TICK_MS = 20;

// Drives one AI scene end to end: the agent's steps run in sequence,
// then the answer streams at 50 chars/sec while the page beneath it
// "generates" — composing the same navigation experience the home
// mockup uses.
export function useProductVisualAutoplay(
  visual: AppPreviewConfig,
  {
    externalScene,
    playbackEnabled = true,
  }: {
    externalScene?: number;
    playbackEnabled?: boolean;
  } = {},
) {
  const [streamedLength, setStreamedLength] = useState(0);
  const [completedStepCount, setCompletedStepCount] = useState(0);
  const timeouts = useTimeoutRegistry();
  const selectedOption =
    externalScene !== undefined
      ? Math.max(0, Math.min(externalScene, PRODUCT_VISUAL_SCENES.length - 1))
      : 0;

  const experience = useAppPreviewExperience(visual);
  const { activeItemId, activePage, selectPageItem } = experience;

  const selectedScene = PRODUCT_VISUAL_SCENES[selectedOption];
  const fullTextVisibleLength = streamedMarkdown.getVisibleLength(
    selectedScene.responseText,
  );
  const streamComplete = streamedLength >= fullTextVisibleLength;
  const streamProgress = displayPage.getStreamProgress(
    streamedLength,
    fullTextVisibleLength,
  );
  const resolvedPage = displayPage.resolveDisplayPage(
    activePage,
    activeItemId,
    selectedScene,
    streamProgress,
  );

  useEffect(() => {
    setStreamedLength(0);
    setCompletedStepCount(0);
    selectPageItem(selectedScene.initialPageItemId);

    if (!playbackEnabled) {
      return undefined;
    }

    const startStreaming = () => {
      if (fullTextVisibleLength === 0) {
        return;
      }

      let index = 0;
      let followUpPageSelected = false;

      const tick = () => {
        index = Math.min(index + 1, fullTextVisibleLength);
        setStreamedLength(index);

        if (
          !followUpPageSelected &&
          selectedScene.followUpPageItemId !== undefined &&
          displayPage.getStreamProgress(index, fullTextVisibleLength) >= 0.6
        ) {
          followUpPageSelected = true;
          selectPageItem(selectedScene.followUpPageItemId);
        }

        if (index < fullTextVisibleLength) {
          timeouts.schedule(tick, STREAM_TICK_MS);
        }
      };

      timeouts.schedule(tick, STREAM_TICK_MS);
    };

    // Agentic preamble: play the steps in sequence, then stream the answer.
    const steps = selectedScene.steps ?? [];

    const playStep = (stepIndex: number) => {
      if (stepIndex >= steps.length) {
        startStreaming();
        return;
      }

      timeouts.schedule(() => {
        setCompletedStepCount(stepIndex + 1);
        playStep(stepIndex + 1);
      }, steps[stepIndex].durationMs);
    };

    playStep(0);

    return () => {
      timeouts.clearAll();
    };
  }, [
    fullTextVisibleLength,
    playbackEnabled,
    selectPageItem,
    selectedScene,
    timeouts,
  ]);

  const agentSteps = selectedScene.steps ?? [];
  const preambleComplete = completedStepCount >= agentSteps.length;
  const activeStepIndex = preambleComplete ? -1 : completedStepCount;

  return {
    ...experience,
    activeStepIndex,
    agentSteps,
    completedStepCount,
    displayPage: resolvedPage,
    selectedScene,
    streamComplete,
    streamedTextVisibleLength: streamedLength,
  };
}
