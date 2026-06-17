import { styled } from '@linaria/react';
import {
  IconChevronDown,
  IconLayoutKanban,
  IconList,
} from '@tabler/icons-react';

import { mediaUp } from '@/tokens';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { previewFontSize } from '@/app-preview/preview-font-size';

import { MiniIcon } from '../primitives/mini-icon';
import { PREVIEW_COLORS } from '../preview-colors';
import { type PageType } from '../types';

const theme = THEME_LIGHT;

const ViewbarBar = styled.div`
  align-items: center;
  background: ${PREVIEW_COLORS.background};
  border-bottom: 1px solid ${PREVIEW_COLORS.borderLight};
  display: flex;
  justify-content: space-between;
  min-width: 0;
  padding-bottom: 8px;
  padding-left: 12px;
  padding-right: 8px;
  padding-top: 8px;
  width: 100%;
`;

const ViewSwitcher = styled.div<{ $tableAligned?: boolean }>`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  gap: 4px;
  height: 24px;
  min-width: 0;
  overflow: hidden;
  padding-right: 4px;
  padding-left: ${({ $tableAligned }) => ($tableAligned ? '0' : '4px')};
`;

const ViewName = styled.span`
  color: ${PREVIEW_COLORS.textSecondary};
  font-family: ${theme.font.family};
  font-size: ${previewFontSize(theme.font.size.md)};
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const ViewCount = styled.span`
  color: ${PREVIEW_COLORS.textLight};
  font-family: ${theme.font.family};
  font-size: ${previewFontSize(theme.font.size.md)};
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const TinyDot = styled.div`
  background: ${PREVIEW_COLORS.borderStrong};
  border-radius: 999px;
  height: 2px;
  width: 2px;
`;

const ViewActions = styled.div`
  align-items: center;
  display: none;
  flex: 0 0 auto;
  gap: 2px;
  margin-left: auto;
  position: relative;
  z-index: 1;

  ${mediaUp('md')} {
    display: flex;
  }
`;

const ViewAction = styled.span`
  align-items: center;
  border-radius: 4px;
  color: ${PREVIEW_COLORS.textSecondary};
  display: flex;
  font-family: ${theme.font.family};
  font-size: ${previewFontSize(theme.font.size.md)};
  font-weight: ${theme.font.weight.regular};
  height: 24px;
  line-height: 1.4;
  padding: 4px 8px;
  white-space: nowrap;
`;

type PreviewViewbarProps = {
  actions: string[];
  count?: number;
  pageType: PageType;
  showListIcon: boolean;
  title: string;
};

export function PreviewViewbar({
  actions,
  count,
  pageType,
  showListIcon,
  title,
}: PreviewViewbarProps) {
  const showPageCount = count !== undefined;
  const isTableAligned = pageType === 'table' && showListIcon;

  return (
    <ViewbarBar>
      <ViewSwitcher $tableAligned={isTableAligned} aria-hidden>
        {showListIcon ? (
          <>
            <MiniIcon
              icon={pageType === 'kanban' ? IconLayoutKanban : IconList}
              color={PREVIEW_COLORS.textSecondary}
              size={16}
            />
            <ViewName>{title}</ViewName>
            {showPageCount ? (
              <>
                <TinyDot />
                <ViewCount>{count}</ViewCount>
                <MiniIcon
                  icon={IconChevronDown}
                  color={PREVIEW_COLORS.textLight}
                />
              </>
            ) : null}
          </>
        ) : (
          <ViewName>{title}</ViewName>
        )}
      </ViewSwitcher>
      {actions.length > 0 ? (
        <ViewActions>
          {actions.map((action) => (
            <ViewAction key={action}>{action}</ViewAction>
          ))}
        </ViewActions>
      ) : null}
    </ViewbarBar>
  );
}
