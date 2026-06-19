import { styled } from '@linaria/react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { type ExplorerNode, type FileIconKind } from './editor-types';

const editor = APP_PREVIEW_TONES.editor;

const Sidebar = styled.div`
  background: ${editor.surface.sidebar};
  border-right: 1px solid ${editor.surface.sidebarBorder};
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
  border-bottom: 1px solid ${editor.surface.explorerHeaderBorder};
  color: ${editor.text.explorerLabel};
  display: flex;
  flex: 0 0 36px;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
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
    background: ${editor.surface.explorerScrollbarThumb};
    border-radius: 999px;
  }
`;

const FileRowStatic = styled.div<{ $active?: boolean; $depth: number }>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? editor.surface.activeRow : 'transparent'};
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
    $active ? editor.surface.activeRow : 'transparent'};
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex: 0 0 24px;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
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
      $active ? editor.surface.activeRow : editor.surface.rowHover};
  }
`;

const Caret = styled.span`
  color: ${editor.text.caret};
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
  font-size: 10px;
`;

const FolderName = styled.span`
  color: ${editor.text.secondary};
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
  font-size: 12px;
`;

const FileName = styled.span<{ $active?: boolean }>`
  color: ${({ $active }) =>
    $active ? editor.text.primary : editor.text.muted};
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 500 : 400)};
`;

const FILE_ICON_COLOR: Record<FileIconKind, string> = {
  ts: editor.fileIcon.ts,
  md: editor.fileIcon.md,
  js: editor.fileIcon.js,
  git: editor.fileIcon.git,
  yaml: editor.fileIcon.yaml,
  cf: editor.fileIcon.cf,
  lock: editor.fileIcon.lock,
};

const FileIcon = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.2px;
`;

function ExplorerNodeRow({
  activeFileId,
  node,
  onSelectFile,
}: {
  activeFileId: string;
  node: ExplorerNode;
  onSelectFile: (fileId: string) => void;
}) {
  if (node.kind === 'folder') {
    return (
      <FileRowStatic $depth={node.depth}>
        <Caret aria-hidden>{node.expanded ? '▾' : '▸'}</Caret>
        <FolderName>{node.name}</FolderName>
      </FileRowStatic>
    );
  }

  const isActive = node.fileId !== undefined && node.fileId === activeFileId;

  if (node.fileId === undefined) {
    return (
      <FileRowStatic $active={isActive} $depth={node.depth}>
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
      $active={isActive}
      $depth={node.depth}
      onClick={() => onSelectFile(fileId)}
      type="button"
    >
      <FileIcon $color={FILE_ICON_COLOR[node.icon]}>{node.iconLabel}</FileIcon>
      <FileName $active={isActive}>{node.name}</FileName>
    </FileRowButton>
  );
}

export function TerminalEditorExplorer({
  activeFileId,
  nodes,
  onSelectFile,
}: {
  activeFileId: string;
  nodes: ReadonlyArray<ExplorerNode>;
  onSelectFile: (fileId: string) => void;
}) {
  return (
    <Sidebar>
      <ExplorerHeader>Explorer</ExplorerHeader>
      <FileTree>
        {nodes.map((node) => (
          <ExplorerNodeRow
            activeFileId={activeFileId}
            key={node.id}
            node={node}
            onSelectFile={onSelectFile}
          />
        ))}
      </FileTree>
    </Sidebar>
  );
}
