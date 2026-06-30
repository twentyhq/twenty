import { styled } from '@linaria/react';
import { IconX } from '@tabler/icons-react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { type EditorFile } from './editor-types';

const editor = APP_PREVIEW_TONES.editor;

const TabBar = styled.div`
  background: ${editor.surface.tabBar};
  border-bottom: 1px solid ${editor.surface.tabBarBorder};
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
    $active ? editor.surface.activeTab : 'transparent'};
  border-right: 1px solid ${editor.surface.tabBarBorder};
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
      $active ? editor.surface.activeTabAccent : 'transparent'};
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  &:hover {
    background: ${({ $active }) =>
      $active ? editor.surface.activeTab : editor.surface.tabHover};
  }
`;

const TabFileIcon = styled.span`
  color: ${editor.text.tabAccent};
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.4px;
`;

const TabTitle = styled.span<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? editor.text.active : editor.text.muted)};
  flex: 1 1 auto;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 500 : 400)};
  white-space: nowrap;
`;

const TabClose = styled.span`
  align-items: center;
  color: ${editor.text.dim};
  display: flex;
  flex: 0 0 14px;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

export function TerminalEditorTabs({
  activeFileId,
  files,
  onCloseFile,
  onSelectFile,
}: {
  activeFileId: string;
  files: ReadonlyArray<EditorFile>;
  onCloseFile: (fileId: string) => void;
  onSelectFile: (fileId: string) => void;
}) {
  return (
    <TabBar>
      {files.map((file) => {
        const isActive = file.id === activeFileId;

        return (
          <Tab
            key={file.id}
            $active={isActive}
            onClick={() => onSelectFile(file.id)}
          >
            <TabFileIcon>TS</TabFileIcon>
            <TabTitle $active={isActive}>{file.name}</TabTitle>
            <TabClose
              aria-hidden
              onClick={(event) => {
                event.stopPropagation();
                onCloseFile(file.id);
              }}
            >
              <IconX size={12} stroke={1.8} />
            </TabClose>
          </Tab>
        );
      })}
    </TabBar>
  );
}
