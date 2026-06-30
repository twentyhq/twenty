'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { CRM_SCENARIO } from '../data/rocket-objects';
import { useTimeoutRegistry } from '../stage/use-timeout-registry';
import { type SidebarEntry } from '../types';

const COMPLETED_CREATED_OBJECT_IDS = CRM_SCENARIO.sequence.map(({ id }) => id);
const COMPLETED_REVEALED_OBJECT_IDS = [
  ...COMPLETED_CREATED_OBJECT_IDS,
  CRM_SCENARIO.companiesItemId,
];
const HIGHLIGHT_RESET_DELAY_MS = 2000;

// The chat's object-creation beats land here: each created object prepends
// its sidebar item (newest first) and pulses its row for two seconds.
export function useAppPreviewCrmScenario(baseWorkspaceEntries: SidebarEntry[]) {
  const timeoutRegistry = useTimeoutRegistry();
  const [createdObjectIds, setCreatedObjectIds] = useState<string[]>([]);
  const [revealedObjectIds, setRevealedObjectIds] = useState<string[]>([]);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  );

  const workspaceEntries = useMemo<SidebarEntry[]>(() => {
    if (createdObjectIds.length === 0) {
      return baseWorkspaceEntries;
    }

    const prependedEntries = createdObjectIds
      .toReversed()
      .map(
        (id) =>
          CRM_SCENARIO.sequence.find((candidate) => candidate.id === id)
            ?.sidebarItem,
      )
      .filter(
        (entry): entry is NonNullable<typeof entry> => entry !== undefined,
      );

    return [...prependedEntries, ...baseWorkspaceEntries];
  }, [baseWorkspaceEntries, createdObjectIds]);

  const handleObjectCreated = useCallback((id: string) => {
    setRevealedObjectIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
    setHighlightedItemId(id);

    if (id === CRM_SCENARIO.companiesItemId) {
      return;
    }

    const sequenceEntry = CRM_SCENARIO.sequence.find(
      (candidate) => candidate.id === id,
    );

    if (!sequenceEntry) {
      throw new Error(
        `AppPreview CRM scenario does not support object id "${id}".`,
      );
    }

    setCreatedObjectIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  }, []);

  const handleScenarioReset = useCallback(() => {
    setCreatedObjectIds([]);
    setRevealedObjectIds([]);
    setHighlightedItemId(null);
  }, []);

  const handleJumpToConversationEnd = useCallback(() => {
    setCreatedObjectIds(COMPLETED_CREATED_OBJECT_IDS);
    setRevealedObjectIds(COMPLETED_REVEALED_OBJECT_IDS);
    setHighlightedItemId(null);
  }, []);

  useEffect(() => {
    if (highlightedItemId === null) {
      return undefined;
    }

    return timeoutRegistry.schedule(
      () => setHighlightedItemId(null),
      HIGHLIGHT_RESET_DELAY_MS,
    );
  }, [highlightedItemId, timeoutRegistry]);

  return {
    handleJumpToConversationEnd,
    handleObjectCreated,
    handleScenarioReset,
    highlightedItemId,
    revealedObjectIds,
    workspaceEntries,
  };
}
