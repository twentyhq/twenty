import { IconX } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import { TERMINAL_TOKENS } from '../../utils/terminal-tokens';
import { type EditorFile } from '../types/editor-data.types';
import { EDITOR_TOKENS } from '../utils/editor-tokens';

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

type TerminalEditorTabsProps = {
  activeFileId: string;
  files: ReadonlyArray<EditorFile>;
  onCloseFile: (fileId: string) => void;
  onSelectFile: (fileId: string) => void;
};

export const TerminalEditorTabs = ({
  activeFileId,
  files,
  onCloseFile,
  onSelectFile,
}: TerminalEditorTabsProps) => (
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
