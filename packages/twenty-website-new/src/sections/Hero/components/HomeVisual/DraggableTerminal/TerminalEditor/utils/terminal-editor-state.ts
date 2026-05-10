import { type ExplorerNode } from '../types/editor-data.types';
import { GENERATED_FILE_IDS } from './editor-generated-file-ids';

const DEFAULT_EDITOR_FILE_ID = 'launch-object';
const STARTER_EDITOR_FILE_ID = 'application-config';

export type TerminalEditorState = {
  activeFileId: string;
  openFileIds: string[];
};

export const getTerminalEditorFallbackFileId = (
  showGeneratedFiles: boolean,
): string =>
  showGeneratedFiles ? DEFAULT_EDITOR_FILE_ID : STARTER_EDITOR_FILE_ID;

export const getInitialTerminalEditorState = (
  showGeneratedFiles: boolean,
): TerminalEditorState => {
  const fallbackFileId = getTerminalEditorFallbackFileId(showGeneratedFiles);

  return {
    activeFileId: fallbackFileId,
    openFileIds: [fallbackFileId],
  };
};

export const syncTerminalEditorStateWithGeneratedFiles = ({
  state,
  showGeneratedFiles,
}: {
  state: TerminalEditorState;
  showGeneratedFiles: boolean;
}): TerminalEditorState => {
  if (showGeneratedFiles) {
    return {
      activeFileId: DEFAULT_EDITOR_FILE_ID,
      openFileIds: state.openFileIds.includes(DEFAULT_EDITOR_FILE_ID)
        ? state.openFileIds
        : [...state.openFileIds, DEFAULT_EDITOR_FILE_ID],
    };
  }

  const openFileIds = state.openFileIds.filter(
    (fileId) => !GENERATED_FILE_IDS.has(fileId),
  );
  const safeOpenFileIds =
    openFileIds.length > 0 ? openFileIds : [STARTER_EDITOR_FILE_ID];
  const activeCandidate = GENERATED_FILE_IDS.has(state.activeFileId)
    ? STARTER_EDITOR_FILE_ID
    : state.activeFileId;

  return {
    activeFileId: safeOpenFileIds.includes(activeCandidate)
      ? activeCandidate
      : safeOpenFileIds[0],
    openFileIds: safeOpenFileIds,
  };
};

export const selectTerminalEditorFile = ({
  state,
  fileId,
}: {
  state: TerminalEditorState;
  fileId: string;
}): TerminalEditorState => ({
  activeFileId: fileId,
  openFileIds: state.openFileIds.includes(fileId)
    ? state.openFileIds
    : [...state.openFileIds, fileId],
});

export const closeTerminalEditorFile = ({
  state,
  fileId,
  fallbackFileId,
}: {
  state: TerminalEditorState;
  fileId: string;
  fallbackFileId: string;
}): TerminalEditorState => {
  const openFileIds = state.openFileIds.filter(
    (openFileId) => openFileId !== fileId,
  );
  const safeOpenFileIds =
    openFileIds.length > 0 ? openFileIds : [fallbackFileId];

  if (state.activeFileId !== fileId) {
    return {
      activeFileId: state.activeFileId,
      openFileIds: safeOpenFileIds,
    };
  }

  return {
    activeFileId: openFileIds[openFileIds.length - 1] ?? fallbackFileId,
    openFileIds: safeOpenFileIds,
  };
};

export const getVisibleTerminalEditorExplorerNodes = (
  nodes: ReadonlyArray<ExplorerNode>,
  showGeneratedFiles: boolean,
): ReadonlyArray<ExplorerNode> =>
  showGeneratedFiles ? nodes : nodes.filter((node) => node.generated !== true);
