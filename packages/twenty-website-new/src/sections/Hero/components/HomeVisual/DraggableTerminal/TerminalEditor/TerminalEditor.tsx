'use client';

import { IconX } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TERMINAL_TOKENS } from '../terminalTokens';
import {
  DEFAULT_EDITOR_FILE_ID,
  EDITOR_FILES,
  EXPLORER_NODES,
  findFileById,
  GENERATED_FILE_IDS,
  STARTER_EDITOR_FILE_ID,
  tokenizeSource,
  type CodeToken,
  type EditorFile,
  type ExplorerNode,
  type FileIconKind,
  type TokenKind,
} from './editorData';
import { EDITOR_TOKENS } from './editorTokens';

const Root = styled.div`
  background: ${EDITOR_TOKENS.surface.body};
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
`;

const Sidebar = styled.div`
  background: ${EDITOR_TOKENS.surface.sidebar};
  border-right: 1px solid ${EDITOR_TOKENS.surface.sidebarBorder};
  display: flex;
  flex: 0 0 206px;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 12px;
  width: 206px;
`;

const ExplorerHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${EDITOR_TOKENS.surface.explorerHeaderBorder};
  color: ${EDITOR_TOKENS.text.explorerLabel};
  display: flex;
  flex: 0 0 36px;
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 11px;
  font-weight: 500;
  height: 36px;
  letter-spacing: 0.4px;
  padding: 0 12px 0 14px;
`;

const FileTree = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding-top: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 999px;
  }
`;

const FileRowStatic = styled.div<{ $active?: boolean; $depth: number }>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? EDITOR_TOKENS.surface.activeRow : 'transparent'};
  display: flex;
  flex: 0 0 24px;
  gap: 6px;
  height: 24px;
  overflow: hidden;
  padding-left: ${({ $depth }) => `${12 + $depth * 14}px`};
  padding-right: 12px;
  white-space: nowrap;
`;

const FileRowButton = styled.button<{ $active?: boolean; $depth: number }>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? EDITOR_TOKENS.surface.activeRow : 'transparent'};
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex: 0 0 24px;
  font-family: ${TERMINAL_TOKENS.font.ui};
  gap: 6px;
  height: 24px;
  overflow: hidden;
  padding-left: ${({ $depth }) => `${12 + $depth * 14}px`};
  padding-right: 12px;
  text-align: left;
  transition: background-color 0.14s ease;
  white-space: nowrap;
  width: 100%;

  &:hover {
    background: ${({ $active }) =>
      $active ? EDITOR_TOKENS.surface.activeRow : 'rgba(255, 255, 255, 0.04)'};
  }
`;

const Caret = styled.span`
  color: ${EDITOR_TOKENS.text.caret};
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 10px;
`;

const FolderName = styled.span`
  color: ${EDITOR_TOKENS.text.secondary};
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 12px;
`;

const FileName = styled.span<{ $active?: boolean }>`
  color: ${({ $active }) =>
    $active ? EDITOR_TOKENS.text.primary : EDITOR_TOKENS.text.muted};
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 500 : 400)};
`;

const FILE_ICON_COLOR: Record<FileIconKind, string> = {
  ts: EDITOR_TOKENS.fileIcon.ts,
  md: EDITOR_TOKENS.fileIcon.md,
  js: EDITOR_TOKENS.fileIcon.js,
  git: EDITOR_TOKENS.fileIcon.git,
  yaml: EDITOR_TOKENS.fileIcon.yaml,
  cf: EDITOR_TOKENS.fileIcon.cf,
  lock: EDITOR_TOKENS.fileIcon.lock,
};

const FileIcon = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.2px;
`;

const EditorShell = styled.div`
  background: ${EDITOR_TOKENS.surface.body};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const TabBar = styled.div`
  background: ${EDITOR_TOKENS.surface.tabBar};
  border-bottom: 1px solid ${EDITOR_TOKENS.surface.tabBarBorder};
  display: flex;
  flex: 0 0 36px;
  height: 36px;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.div<{ $active?: boolean }>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? EDITOR_TOKENS.surface.activeTab : 'transparent'};
  border-right: 1px solid ${EDITOR_TOKENS.surface.tabBarBorder};
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  height: 36px;
  padding: 0 12px 0 14px;
  position: relative;
  transition: background-color 0.14s ease;

  &::before {
    background: ${({ $active }) =>
      $active ? EDITOR_TOKENS.surface.activeTabAccent : 'transparent'};
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  &:hover {
    background: ${({ $active }) =>
      $active ? EDITOR_TOKENS.surface.activeTab : 'rgba(255, 255, 255, 0.03)'};
  }
`;

const TabFileIcon = styled.span`
  color: ${EDITOR_TOKENS.text.tabAccent};
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.4px;
`;

const TabTitle = styled.span<{ $active?: boolean }>`
  color: ${({ $active }) =>
    $active ? EDITOR_TOKENS.text.active : EDITOR_TOKENS.text.muted};
  flex: 1 1 auto;
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 500 : 400)};
  white-space: nowrap;
`;

const TabClose = styled.span`
  align-items: center;
  color: ${EDITOR_TOKENS.text.dim};
  display: flex;
  flex: 0 0 14px;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const CodeRegion = styled.div`
  background: ${EDITOR_TOKENS.surface.body};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
  padding: 12px 0;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;

  &::-webkit-scrollbar {
    background: ${EDITOR_TOKENS.surface.body};
    height: 8px;
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${EDITOR_TOKENS.surface.body};
  }
  &::-webkit-scrollbar-corner {
    background: ${EDITOR_TOKENS.surface.body};
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 999px;
  }
`;

const CodeStack = styled.div`
  display: flex;
  flex-direction: column;
  min-width: min-content;
`;

const CodeLineRow = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  min-width: max-content;
`;

const Gutter = styled.div`
  color: ${EDITOR_TOKENS.text.gutter};
  display: flex;
  flex: 0 0 52px;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 12px;
  height: 20px;
  justify-content: flex-end;
  padding-right: 12px;
  user-select: none;
  width: 52px;
`;

const CodeText = styled.pre`
  color: ${EDITOR_TOKENS.text.code};
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 13px;
  line-height: 20px;
  margin: 0;
  padding: 0;
  white-space: pre;
`;

const TOKEN_COLOR: Record<TokenKind, string> = {
  text: EDITOR_TOKENS.text.code,
  keyword: EDITOR_TOKENS.syntax.keyword,
  function: EDITOR_TOKENS.syntax.function,
  string: EDITOR_TOKENS.syntax.string,
  property: EDITOR_TOKENS.syntax.property,
  identifier: EDITOR_TOKENS.syntax.identifier,
  comment: EDITOR_TOKENS.syntax.comment,
};

const renderCodeToken = (token: CodeToken, index: number) => {
  if (token.kind === 'text') {
    return <span key={index}>{token.value}</span>;
  }
  return (
    <span key={index} style={{ color: TOKEN_COLOR[token.kind] }}>
      {token.value}
    </span>
  );
};

const renderExplorerNode = (
  node: ExplorerNode,
  activeFileId: string,
  onSelect: (fileId: string) => void,
) => {
  if (node.kind === 'folder') {
    return (
      <FileRowStatic key={node.id} $depth={node.depth}>
        <Caret aria-hidden>{node.expanded ? '▾' : '▸'}</Caret>
        <FolderName>{node.name}</FolderName>
      </FileRowStatic>
    );
  }

  const isSelectable = Boolean(node.fileId);
  const isActive = node.fileId !== undefined && node.fileId === activeFileId;

  if (!isSelectable) {
    return (
      <FileRowStatic key={node.id} $active={isActive} $depth={node.depth}>
        <FileIcon $color={FILE_ICON_COLOR[node.icon]}>
          {node.iconLabel}
        </FileIcon>
        <FileName $active={isActive}>{node.name}</FileName>
      </FileRowStatic>
    );
  }

  return (
    <FileRowButton
      key={node.id}
      $active={isActive}
      $depth={node.depth}
      onClick={() => onSelect(node.fileId as string)}
      type="button"
    >
      <FileIcon $color={FILE_ICON_COLOR[node.icon]}>{node.iconLabel}</FileIcon>
      <FileName $active={isActive}>{node.name}</FileName>
    </FileRowButton>
  );
};

type TerminalEditorProps = {
  // When false, hide files scaffolded by the assistant so the editor can be
  // opened before the chat has run.
  showGeneratedFiles?: boolean;
};

// Browser-like editor: click files in the tree or tabs in the top bar to swap
// the visible buffer. Open tabs track files the visitor has touched during
// this session so they can jump back quickly.
export const TerminalEditor = ({
  showGeneratedFiles = true,
}: TerminalEditorProps) => {
  const fallbackFileId = showGeneratedFiles
    ? DEFAULT_EDITOR_FILE_ID
    : STARTER_EDITOR_FILE_ID;

  const [activeFileId, setActiveFileId] = useState<string>(fallbackFileId);
  const [openFileIds, setOpenFileIds] = useState<string[]>([fallbackFileId]);

  // When chat hasn't run, generated tabs must not be visible. When chat
  // finishes, pop open the default generated file so the new state is
  // discoverable without the user hunting for it in the tree.
  useEffect(() => {
    if (!showGeneratedFiles) {
      setOpenFileIds((current) => {
        const next = current.filter((id) => !GENERATED_FILE_IDS.has(id));
        return next.length > 0 ? next : [STARTER_EDITOR_FILE_ID];
      });
      setActiveFileId((current) =>
        GENERATED_FILE_IDS.has(current) ? STARTER_EDITOR_FILE_ID : current,
      );
      return;
    }
    setActiveFileId(DEFAULT_EDITOR_FILE_ID);
    setOpenFileIds((current) =>
      current.includes(DEFAULT_EDITOR_FILE_ID)
        ? current
        : [...current, DEFAULT_EDITOR_FILE_ID],
    );
  }, [showGeneratedFiles]);

  const handleSelectFile = useCallback((fileId: string) => {
    setActiveFileId(fileId);
    setOpenFileIds((current) =>
      current.includes(fileId) ? current : [...current, fileId],
    );
  }, []);

  const handleCloseTab = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>, fileId: string) => {
      event.stopPropagation();
      setOpenFileIds((current) => {
        const next = current.filter((id) => id !== fileId);
        if (next.length === 0) {
          // Keep the fallback file visible so the editor never empties.
          return [fallbackFileId];
        }
        return next;
      });
      setActiveFileId((current) => {
        if (current !== fileId) {
          return current;
        }
        const remaining = openFileIds.filter((id) => id !== fileId);
        return remaining[remaining.length - 1] ?? fallbackFileId;
      });
    },
    [fallbackFileId, openFileIds],
  );

  const visibleExplorerNodes = useMemo(
    () =>
      showGeneratedFiles
        ? EXPLORER_NODES
        : EXPLORER_NODES.filter(
            (node) => !('generated' in node && node.generated),
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
      <Sidebar>
        <ExplorerHeader>Explorer</ExplorerHeader>
        <FileTree>
          {visibleExplorerNodes.map((node) =>
            renderExplorerNode(node, activeFileId, handleSelectFile),
          )}
        </FileTree>
      </Sidebar>
      <EditorShell>
        <TabBar>
          {openFiles.map((file) => {
            const isActive = file.id === activeFileId;
            return (
              <Tab
                key={file.id}
                $active={isActive}
                onClick={() => setActiveFileId(file.id)}
              >
                <TabFileIcon>TS</TabFileIcon>
                <TabTitle $active={isActive}>{file.name}</TabTitle>
                <TabClose
                  aria-hidden
                  onClick={(event) => handleCloseTab(event, file.id)}
                >
                  <IconX size={12} stroke={1.8} />
                </TabClose>
              </Tab>
            );
          })}
        </TabBar>
        <CodeRegion>
          <CodeStack>
            {codeLines.map((line, index) => (
              <CodeLineRow key={`${activeFile.id}-${index}`}>
                <Gutter>{index + 1}</Gutter>
                <CodeText>
                  {line.length === 0 ? ' ' : line.map(renderCodeToken)}
                </CodeText>
              </CodeLineRow>
            ))}
          </CodeStack>
        </CodeRegion>
      </EditorShell>
    </Root>
  );
};
