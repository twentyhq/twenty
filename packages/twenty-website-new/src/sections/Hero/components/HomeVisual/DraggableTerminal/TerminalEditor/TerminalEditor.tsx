'use client';

import { styled } from '@linaria/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EDITOR_FILES,
  EXPLORER_NODES,
  findFileById,
  tokenizeSource,
  type EditorFile,
} from './editorData';
import { EDITOR_TOKENS } from './editorTokens';
import { TerminalEditorCodeView } from './TerminalEditorCodeView';
import { TerminalEditorExplorer } from './TerminalEditorExplorer';
import { TerminalEditorTabs } from './TerminalEditorTabs';
import {
  closeTerminalEditorFile,
  getInitialTerminalEditorState,
  getTerminalEditorFallbackFileId,
  getVisibleTerminalEditorExplorerNodes,
  selectTerminalEditorFile,
  syncTerminalEditorStateWithGeneratedFiles,
} from './terminal-editor-state';

const Root = styled.div`
  background: ${EDITOR_TOKENS.surface.body};
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
`;

const EditorShell = styled.div`
  background: ${EDITOR_TOKENS.surface.body};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

type TerminalEditorProps = {
  showGeneratedFiles?: boolean;
};

export const TerminalEditor = ({
  showGeneratedFiles = true,
}: TerminalEditorProps) => {
  const fallbackFileId = getTerminalEditorFallbackFileId(showGeneratedFiles);
  const [editorState, setEditorState] = useState(() =>
    getInitialTerminalEditorState(showGeneratedFiles),
  );
  const { activeFileId, openFileIds } = editorState;

  useEffect(() => {
    setEditorState((state) =>
      syncTerminalEditorStateWithGeneratedFiles({
        state,
        showGeneratedFiles,
      }),
    );
  }, [showGeneratedFiles]);

  const handleSelectFile = useCallback((fileId: string) => {
    setEditorState((state) =>
      selectTerminalEditorFile({
        state,
        fileId,
      }),
    );
  }, []);

  const handleCloseFile = useCallback(
    (fileId: string) => {
      setEditorState((state) =>
        closeTerminalEditorFile({
          state,
          fileId,
          fallbackFileId,
        }),
      );
    },
    [fallbackFileId],
  );

  const visibleExplorerNodes = useMemo(
    () =>
      getVisibleTerminalEditorExplorerNodes(EXPLORER_NODES, showGeneratedFiles),
    [showGeneratedFiles],
  );

  const activeFile: EditorFile =
    findFileById(activeFileId) ??
    findFileById(fallbackFileId) ??
    EDITOR_FILES[0];

  const codeLines = useMemo(
    () => tokenizeSource(activeFile.source),
    [activeFile.source],
  );

  const openFiles = useMemo(
    () =>
      openFileIds
        .map((id) => findFileById(id))
        .filter((file): file is EditorFile => file !== undefined),
    [openFileIds],
  );

  return (
    <Root>
      <TerminalEditorExplorer
        activeFileId={activeFileId}
        nodes={visibleExplorerNodes}
        onSelectFile={handleSelectFile}
      />
      <EditorShell>
        <TerminalEditorTabs
          activeFileId={activeFileId}
          files={openFiles}
          onCloseFile={handleCloseFile}
          onSelectFile={handleSelectFile}
        />
        <TerminalEditorCodeView activeFile={activeFile} codeLines={codeLines} />
      </EditorShell>
    </Root>
  );
};
