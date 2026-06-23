'use client';

import { styled } from '@linaria/react';
import { IconPlus } from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

import { RecordTabHeader } from '../components/RecordTabHeader';
import { ThreadRow } from './components/ThreadRow';
import { THREADS } from './data/threads';

const Root = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: var(--font-product), sans-serif;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Panel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding-top: 8px;
`;

const InboxHeader = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  padding: 8px 16px 12px;
`;

const InboxTitle = styled.span`
  align-items: baseline;
  color: ${THEME_LIGHT.font.color.primary};
  display: flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.semiBold};
  gap: 6px;
`;

const InboxCount = styled.span`
  color: ${THEME_LIGHT.font.color.light};
  font-weight: ${THEME_LIGHT.font.weight.regular};
`;

const ComposeButton = styled.span`
  align-items: center;
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.font.color.secondary};
  display: inline-flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  gap: 4px;
  padding: 4px 8px;
`;

const ThreadList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

export function EmailsVisual({ active: _active }: { active: boolean }) {
  return (
    <Root>
      <RecordTabHeader active="Emails" />
      <Panel>
        <InboxHeader>
          <InboxTitle>
            Inbox
            <InboxCount>{THREADS.length}</InboxCount>
          </InboxTitle>
          <ComposeButton>
            <IconPlus size={12} stroke={2} />
            Compose
          </ComposeButton>
        </InboxHeader>
        <ThreadList>
          {THREADS.map((thread) => (
            <ThreadRow key={thread.participants[0].name} thread={thread} />
          ))}
        </ThreadList>
      </Panel>
    </Root>
  );
}
