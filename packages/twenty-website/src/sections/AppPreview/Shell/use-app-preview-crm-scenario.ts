import { useTimeoutRegistry } from '@/lib/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { COMPANIES_ITEM_ID, CRM_OBJECT_SEQUENCE } from '../Data/rocket-object';
import type { SidebarEntry } from '../types';

const COMPLETED_CREATED_OBJECT_IDS = CRM_OBJECT_SEQUENCE.map(({ id }) => id);
const COMPLETED_REVEALED_OBJECT_IDS = [
  ...COMPLETED_CREATED_OBJECT_IDS,
  COMPANIES_ITEM_ID,
];
const HIGHLIGHT_RESET_DELAY_MS = 2000;

export const COMPLETED_ACTIVE_OBJECT_ID = CRM_OBJECT_SEQUENCE.at(-1)!.id;

type AppPreviewCrmScenario = {
  handleJumpToConversationEnd: () => void;
  handleObjectCreated: (id: string) => void;
  handleScenarioReset: () => void;
  highlightedItemId: string | null;
  revealedObjectIds: string[];
  workspaceEntries: SidebarEntry[];
};

export function useAppPreviewCrmScenario(
  baseWorkspaceEntries: SidebarEntry[],
): AppPreviewCrmScenario {
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

    const prependedEntries = [...createdObjectIds]
      .reverse()
      .map(
        (id) =>
          CRM_OBJECT_SEQUENCE.find((candidate) => candidate.id === id)
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

    if (id === COMPANIES_ITEM_ID) {
      return;
    }

    const sequenceEntry = CRM_OBJECT_SEQUENCE.find(
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
