import { styled } from '@linaria/react';
import { TERMINAL_TOKENS } from '../../utils/terminal-tokens';
import {
  type ExplorerNode,
  type FileIconKind,
} from '../types/editor-data.types';
import { EDITOR_TOKENS } from '../utils/editor-tokens';

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

type TerminalEditorExplorerProps = {
  activeFileId: string;
  nodes: ReadonlyArray<ExplorerNode>;
  onSelectFile: (fileId: string) => void;
};

const TerminalEditorExplorerNode = ({
  activeFileId,
  node,
  onSelectFile,
}: {
  activeFileId: string;
  node: ExplorerNode;
  onSelectFile: (fileId: string) => void;
}) => {
  if (node.kind === 'folder') {
    return (
      <FileRowStatic key={node.id} $depth={node.depth}>
        <Caret aria-hidden>{node.expanded ? '▾' : '▸'}</Caret>
        <FolderName>{node.name}</FolderName>
      </FileRowStatic>
    );
  }

  const isActive = node.fileId !== undefined && node.fileId === activeFileId;

  if (node.fileId === undefined) {
    return (
      <FileRowStatic key={node.id} $active={isActive} $depth={node.depth}>
        <FileIcon $color={FILE_ICON_COLOR[node.icon]}>
          {node.iconLabel}
        </FileIcon>
        <FileName $active={isActive}>{node.name}</FileName>
      </FileRowStatic>
    );
  }

  const fileId = node.fileId;

  return (
    <FileRowButton
      key={node.id}
      $active={isActive}
      $depth={node.depth}
      onClick={() => onSelectFile(fileId)}
      type="button"
    >
      <FileIcon $color={FILE_ICON_COLOR[node.icon]}>{node.iconLabel}</FileIcon>
      <FileName $active={isActive}>{node.name}</FileName>
    </FileRowButton>
  );
};

export const TerminalEditorExplorer = ({
  activeFileId,
  nodes,
  onSelectFile,
}: TerminalEditorExplorerProps) => (
  <Sidebar>
    <ExplorerHeader>Explorer</ExplorerHeader>
    <FileTree>
      {nodes.map((node) => (
        <TerminalEditorExplorerNode
          activeFileId={activeFileId}
          key={node.id}
          node={node}
          onSelectFile={onSelectFile}
        />
      ))}
    </FileTree>
  </Sidebar>
);
