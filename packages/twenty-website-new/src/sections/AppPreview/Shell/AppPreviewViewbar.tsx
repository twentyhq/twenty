'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconChevronDown,
  IconLayoutKanban,
  IconList,
} from '@tabler/icons-react';

import type { PageType } from '../types';
import { MiniIcon } from '../Shared/components/MiniIcon';
import { APP_FONT, COLORS } from '../Shared/utils/app-preview-theme';

const ViewbarBar = styled.div`
  align-items: center;
  background: ${COLORS.background};
  border-bottom: 1px solid ${COLORS.borderLight};
  display: flex;
  justify-content: space-between;
  min-width: 0;
  padding: 8px 8px 8px 12px;
  width: 100%;
`;

const ViewSwitcher = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  gap: 4px;
  height: 24px;
  min-width: 0;
  overflow: hidden;
  padding: 0 4px;
`;

const ViewName = styled.span`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const ViewCount = styled.span`
  color: ${COLORS.textLight};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const TinyDot = styled.div`
  background: ${COLORS.borderStrong};
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

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
  }
`;

const ViewAction = styled.span`
  align-items: center;
  border-radius: 4px;
  color: ${COLORS.textSecondary};
  display: flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  height: 24px;
  line-height: 1.4;
  padding: 4px 8px;
  white-space: nowrap;
`;

type AppPreviewViewbarProps = {
  actions: string[];
  count?: number;
  pageType: PageType;
  showListIcon: boolean;
  title: string;
};

export function AppPreviewViewbar({
  actions,
  count,
  pageType,
  showListIcon,
  title,
}: AppPreviewViewbarProps) {
  const showPageCount = count !== undefined;

  return (
    <ViewbarBar>
      <ViewSwitcher aria-hidden="true">
        {showListIcon ? (
          <>
            {pageType === 'kanban' ? (
              <MiniIcon
                icon={IconLayoutKanban}
                color={COLORS.textSecondary}
                size={16}
              />
            ) : (
              <MiniIcon
                icon={IconList}
                color={COLORS.textSecondary}
                size={16}
              />
            )}
            <ViewName>{title}</ViewName>
            {showPageCount ? (
              <>
                <TinyDot />
                <ViewCount>{count}</ViewCount>
                <MiniIcon icon={IconChevronDown} color={COLORS.textLight} />
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
