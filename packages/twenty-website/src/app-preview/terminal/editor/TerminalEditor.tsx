'use client';

import { styled } from '@linaria/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { EDITOR_FILES } from './editor-files';
import { EXPLORER_NODES } from './editor-explorer-nodes';
import { type EditorFile } from './editor-types';
import { TerminalEditorCodeView } from './TerminalEditorCodeView';
import { TerminalEditorExplorer } from './TerminalEditorExplorer';
import { TerminalEditorTabs } from './TerminalEditorTabs';
import { terminalEditorState } from './terminal-editor-state';
import { tokenizeSource } from './tokenize-editor-source';

const findFileById = (fileId: string): EditorFile | undefined =>
  EDITOR_FILES.find((file) => file.id === fileId);

const Root = styled.div`
  background: ${APP_PREVIEW_TONES.editor.surface.body};
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
`;

const EditorShell = styled.div`
  background: ${APP_PREVIEW_TONES.editor.surface.body};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

export function TerminalEditor({
  showGeneratedFiles = true,
}: {
  showGeneratedFiles?: boolean;
}) {
  const fallbackFileId =
    terminalEditorState.getFallbackFileId(showGeneratedFiles);
  const [editorState, setEditorState] = useState(() =>
    terminalEditorState.getInitialState(showGeneratedFiles),
  );
  const { activeFileId, openFileIds } = editorState;

  useEffect(() => {
    setEditorState((state) =>
      terminalEditorState.syncWithGeneratedFiles({
        state,
        showGeneratedFiles,
      }),
    );
  }, [showGeneratedFiles]);

  const handleSelectFile = useCallback((fileId: string) => {
    setEditorState((state) =>
      terminalEditorState.selectFile({
        state,
        fileId,
      }),
    );
  }, []);

  const handleCloseFile = useCallback(
    (fileId: string) => {
      setEditorState((state) =>
        terminalEditorState.closeFile({
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
      terminalEditorState.getVisibleExplorerNodes(
        EXPLORER_NODES,
        showGeneratedFiles,
      ),
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
}
