import { type ExplorerNode } from './editor-types';
import { GENERATED_FILE_IDS } from './editor-generated-file-ids';

const DEFAULT_EDITOR_FILE_ID = 'launch-object';
const STARTER_EDITOR_FILE_ID = 'application-config';

export type TerminalEditorStateValue = {
  activeFileId: string;
  openFileIds: string[];
};

const getFallbackFileId = (showGeneratedFiles: boolean): string =>
  showGeneratedFiles ? DEFAULT_EDITOR_FILE_ID : STARTER_EDITOR_FILE_ID;

const getInitialState = (
  showGeneratedFiles: boolean,
): TerminalEditorStateValue => {
  const fallbackFileId = getFallbackFileId(showGeneratedFiles);

  return {
    activeFileId: fallbackFileId,
    openFileIds: [fallbackFileId],
  };
};

const syncWithGeneratedFiles = ({
  state,
  showGeneratedFiles,
}: {
  state: TerminalEditorStateValue;
  showGeneratedFiles: boolean;
}): TerminalEditorStateValue => {
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

const selectFile = ({
  state,
  fileId,
}: {
  state: TerminalEditorStateValue;
  fileId: string;
}): TerminalEditorStateValue => ({
  activeFileId: fileId,
  openFileIds: state.openFileIds.includes(fileId)
    ? state.openFileIds
    : [...state.openFileIds, fileId],
});

const closeFile = ({
  state,
  fileId,
  fallbackFileId,
}: {
  state: TerminalEditorStateValue;
  fileId: string;
  fallbackFileId: string;
}): TerminalEditorStateValue => {
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

const getVisibleExplorerNodes = (
  nodes: ReadonlyArray<ExplorerNode>,
  showGeneratedFiles: boolean,
): ReadonlyArray<ExplorerNode> =>
  showGeneratedFiles ? nodes : nodes.filter((node) => node.generated !== true);

export const terminalEditorState = {
  closeFile,
  getFallbackFileId,
  getInitialState,
  getVisibleExplorerNodes,
  selectFile,
  syncWithGeneratedFiles,
};
