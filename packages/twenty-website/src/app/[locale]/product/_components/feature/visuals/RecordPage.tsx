'use client';

import { styled } from '@linaria/react';
import { IconChevronLeft } from '@tabler/icons-react';
import { type ReactNode, useState } from 'react';

import { RecordTabBar } from './RecordTabBar';
import { CalendarTab } from './record-tabs/CalendarTab';
import { EmailsTab } from './record-tabs/EmailsTab';
import { FilesTab } from './record-tabs/FilesTab';
import { NotesTab } from './record-tabs/NotesTab';
import { TasksTab } from './record-tabs/TasksTab';
import { TimelineTab } from './record-tabs/TimelineTab';
import {
  BG_DARK,
  CARD_BORDER,
  CARD_FONT,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
} from './visual-tokens';

const ALL_TABS = ['Timeline', 'Tasks', 'Notes', 'Files', 'Emails', 'Calendar'];

const Root = styled.div`
  background-color: ${BG_DARK};
  display: flex;
  flex-direction: column;
  font-family: ${CARD_FONT};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const TopBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${CARD_BORDER};
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  padding: 9px 12px;
`;

const BackButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${CARD_TEXT_SECONDARY};
  cursor: pointer;
  display: inline-flex;
  padding: 0;

  svg {
    height: 16px;
    width: 16px;
  }
`;

const Crumb = styled.span`
  color: ${CARD_TEXT};
  font-size: 13px;
  font-weight: 500;
`;

const ScrollArea = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Split = styled.div`
  display: flex;
  height: 100%;
  min-width: max-content;
`;

const Side = styled.div`
  border-right: 1px solid ${CARD_BORDER};
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  width: 220px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
  width: 380px;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

type RecordPageProps = {
  defaultTab: string;
  switchable?: readonly string[];
  onBack?: () => void;
  title?: string;
  sidePanel?: ReactNode;
};

export function RecordPage({
  defaultTab,
  switchable = ALL_TABS,
  onBack,
  title,
  sidePanel,
}: RecordPageProps) {
  const [tab, setTab] = useState(defaultTab);

  const tabBarAndBody = (
    <>
      <RecordTabBar active={tab} onSelect={setTab} switchable={switchable} />
      <Body>
        {tab === 'Timeline' ? <TimelineTab /> : null}
        {tab === 'Tasks' ? <TasksTab /> : null}
        {tab === 'Notes' ? <NotesTab /> : null}
        {tab === 'Files' ? <FilesTab /> : null}
        {tab === 'Emails' ? <EmailsTab /> : null}
        {tab === 'Calendar' ? <CalendarTab /> : null}
      </Body>
    </>
  );

  if (sidePanel) {
    return (
      <Root>
        <TopBar>
          {onBack ? (
            <BackButton aria-label="Back" onClick={onBack}>
              <IconChevronLeft />
            </BackButton>
          ) : null}
          {title ? <Crumb>{title}</Crumb> : null}
        </TopBar>
        <ScrollArea>
          <Split>
            <Side>{sidePanel}</Side>
            <Main>{tabBarAndBody}</Main>
          </Split>
        </ScrollArea>
      </Root>
    );
  }

  return <Root>{tabBarAndBody}</Root>;
}
