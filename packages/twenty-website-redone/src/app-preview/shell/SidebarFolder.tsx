'use client';

import { styled } from '@linaria/react';
import { IconChevronDown } from '@tabler/icons-react';

import { THEME_LIGHT } from 'twenty-ui/theme';
import { previewFontSize } from '@/app-preview/preview-font-size';
import { APP_PREVIEW_CHROME } from '@/app-preview/app-preview-chrome';

import { SidebarItem } from './SidebarItem';
import { MiniIcon } from '../primitives/MiniIcon';
import { renderPreviewIcon } from '../primitives/PreviewIcon';
import { type SidebarFolderDef } from '../types';

const FolderButton = styled.button<{ $expanded?: boolean }>`
  align-items: center;
  appearance: none;
  background: ${({ $expanded }) =>
    $expanded ? THEME_LIGHT.background.transparent.light : 'transparent'};
  border: 0;
  border-radius: ${THEME_LIGHT.border.radius.sm};
  cursor: pointer;
  display: flex;
  height: ${APP_PREVIEW_CHROME.navigationItemHeightPx}px;
  justify-content: flex-start;
  padding-left: 4px;
  padding-right: 2px;
  text-align: left;
  transition: background-color 0.14s ease;
  width: 100%;

  &:hover {
    background: ${THEME_LIGHT.background.transparent.light};
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
  color: ${THEME_LIGHT.font.color.secondary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FolderChevron = styled.div<{ $expanded?: boolean }>`
  color: ${THEME_LIGHT.font.color.tertiary};
  display: flex;
  flex: 0 0 auto;
  margin-left: auto;
  transform: rotate(${({ $expanded }) => ($expanded ? '0deg' : '-90deg')});
  transition: transform 0.16s ease;
`;

const ChildStack = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  row-gap: 2px;
`;

const BranchLine = styled.div`
  background: ${THEME_LIGHT.border.color.strong};
  bottom: 14px;
  left: 11px;
  position: absolute;
  top: 0;
  width: 1px;
`;

export function SidebarFolder({
  expanded,
  folder,
  onSelectItem,
  onToggleExpanded,
  selectedItemId,
}: {
  expanded: boolean;
  folder: SidebarFolderDef;
  onSelectItem?: (itemId: string) => void;
  onToggleExpanded?: () => void;
  selectedItemId?: string;
}) {
  const visibleItems = folder.items.filter((item) => !item.hidden);
  const hasActiveChild = visibleItems.some(
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
            color={THEME_LIGHT.font.color.tertiary}
            icon={IconChevronDown}
            size={12}
          />
        </FolderChevron>
      </FolderButton>
      {expanded ? (
        <ChildStack>
          <BranchLine />
          {visibleItems.map((item, index) => (
            <SidebarItem
              active={item.id === selectedItemId}
              depth={1}
              isLastChild={index === visibleItems.length - 1}
              item={item}
              key={item.id}
              onSelect={onSelectItem}
            />
          ))}
        </ChildStack>
      ) : null}
    </>
  );
}
