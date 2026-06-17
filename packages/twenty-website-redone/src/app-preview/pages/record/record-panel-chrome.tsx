import { styled } from '@linaria/react';

import { EASING } from '@/tokens';
import { THEME_LIGHT as theme } from 'twenty-ui/theme';

import { PREVIEW_COLORS } from '../../preview-colors';

const TabSection = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 24px 24px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 16px 0;
`;

const TabHeaderLabel = styled.span`
  align-items: baseline;
  display: inline-flex;
`;

const TabHeaderTitle = styled.span`
  color: ${PREVIEW_COLORS.text};
  font-family: ${theme.font.family};
  font-size: 13px;
  font-weight: 600;
`;

const TabHeaderCount = styled.span`
  color: ${PREVIEW_COLORS.textLight};
  font-family: ${theme.font.family};
  font-size: 13px;
  margin-left: 8px;
`;

const TabAddButton = styled.span`
  align-items: center;
  border: 1px solid ${PREVIEW_COLORS.border};
  border-radius: 4px;
  color: ${PREVIEW_COLORS.textSecondary};
  display: inline-flex;
  font-family: ${theme.font.family};
  font-size: 13px;
  gap: 4px;
  height: 26px;
  padding: 0 8px;
`;

const ListCard = styled.div`
  background: ${PREVIEW_COLORS.backgroundSecondary};
  border: 1px solid ${PREVIEW_COLORS.border};
  border-radius: 8px;
  overflow: hidden;
`;

// Mirrors twenty-front's ActivityRow: 48px tall, 16px horizontal padding,
// 8px gap, sitting inside a bordered card with 1px dividers between rows.
const ActivityRowBox = styled.div<{ $index: number }>`
  align-items: center;
  animation: activityRowAppear 360ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${120 + $index * 70}ms`};
  display: flex;
  gap: 8px;
  height: 48px;
  padding: 0 16px;

  & + & {
    border-top: 1px solid ${PREVIEW_COLORS.borderLight};
  }

  @keyframes activityRowAppear {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// The activity-tab chrome every list panel (tasks, files, emails,
// calendar) composes: section scroller, counted header, bordered card.
export const RECORD_PANEL_CHROME = {
  ActivityRowBox,
  ListCard,
  TabAddButton,
  TabHeader,
  TabHeaderCount,
  TabHeaderLabel,
  TabHeaderTitle,
  TabSection,
};
