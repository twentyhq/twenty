'use client';

import { styled } from '@linaria/react';
import { IconChevronDown } from '@tabler/icons-react';

import type { SidebarFolderDef } from '../types';
import { MiniIcon } from '../Shared/components/MiniIcon';
import { renderPreviewIcon } from '../Shared/components/PreviewIcon';
import { APP_FONT, COLORS } from '../Shared/utils/app-preview-theme';
import {
  DesktopBranchLine,
  DesktopChildStack,
  SidebarDesktopItem,
} from './SidebarDesktopItem';

const SIDEBAR_ACTIVE_BACKGROUND = 'rgba(0, 0, 0, 0.04)';

const FolderButton = styled.button<{ $expanded?: boolean }>`
  align-items: center;
  background: ${({ $expanded }) =>
    $expanded ? SIDEBAR_ACTIVE_BACKGROUND : 'transparent'};
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: flex-start;
  padding-bottom: 0;
  padding-left: 4px;
  padding-right: 2px;
  padding-top: 0;
  transition: background-color 0.14s ease;
  width: 100%;

  &:hover {
    background: ${SIDEBAR_ACTIVE_BACKGROUND};
  }
`;

const FolderRowMain = styled.div`
  align-items: center;
  column-gap: 8px;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
`;

const FolderText = styled.span`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FolderChevron = styled.div<{ $expanded?: boolean }>`
  color: ${COLORS.textTertiary};
  display: flex;
  flex: 0 0 auto;
  margin-left: auto;
  transform: rotate(${({ $expanded }) => ($expanded ? '0deg' : '-90deg')});
  transition: transform 0.16s ease;
`;

type SidebarDesktopFolderProps = {
  expanded: boolean;
  folder: SidebarFolderDef;
  highlightedItemId?: string;
  onSelectItem?: (itemId: string) => void;
  onToggleExpanded: () => void;
  selectedItemId?: string;
};

export function SidebarDesktopFolder({
  expanded,
  folder,
  highlightedItemId,
  onSelectItem,
  onToggleExpanded,
  selectedItemId,
}: SidebarDesktopFolderProps) {
  const hasActiveChild = folder.items.some(
    (item) => item.id === selectedItemId,
  );

  return (
    <>
      <FolderButton
        $expanded={expanded || hasActiveChild}
        onClick={onToggleExpanded}
        type="button"
      >
        <FolderRowMain>
          {renderPreviewIcon(folder.icon)}
          <FolderText>{folder.label}</FolderText>
        </FolderRowMain>
        <FolderChevron $expanded={expanded}>
          <MiniIcon
            color={COLORS.textTertiary}
            icon={IconChevronDown}
            size={12}
          />
        </FolderChevron>
      </FolderButton>
      {expanded ? (
        <DesktopChildStack>
          <DesktopBranchLine />
          {folder.items.map((item, index) => (
            <SidebarDesktopItem
              depth={1}
              highlightedItemId={highlightedItemId}
              isLastChild={index === folder.items.length - 1}
              item={item}
              key={item.id}
              onSelect={onSelectItem}
              selectedItemId={selectedItemId}
            />
          ))}
        </DesktopChildStack>
      ) : null}
    </>
  );
}
