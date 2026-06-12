'use client';

import { styled } from '@linaria/react';
import { IconChevronDown } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { EASING } from '@/tokens';
import { APP_PREVIEW_THEME as theme } from '@/tokens/app-preview/app-preview-theme';

import { FaviconLogo } from '../../primitives/favicon-logo';
import { PREVIEW_COLORS } from '../../preview-colors';
import { type RecordPageDefinition } from '../../types';
import { recordFieldValue } from './record-field-value';
import { RecordCalendar } from './record-calendar';
import { RecordEmails } from './record-emails';
import { RecordFiles } from './record-files';
import { RecordNotes } from './record-notes';
import { RecordTasks } from './record-tasks';
import { RecordTimeline } from './record-timeline';
import { recordTabs } from './record-tabs';

const Shell = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const LeftPanel = styled.div`
  border-right: 1px solid ${PREVIEW_COLORS.borderLight};
  display: flex;
  flex: 0 0 248px;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding: 16px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const RecordHeader = styled.div`
  align-items: center;
  animation: recordHeaderAppear 420ms ${EASING.standard} both;
  animation-delay: 120ms;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 127px;
  justify-content: center;
  padding-bottom: 8px;

  @keyframes recordHeaderAppear {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const RecordName = styled.div`
  font-family: ${theme.font.family};
  font-size: 20px;
  font-weight: 600;
  color: ${PREVIEW_COLORS.text};
  line-height: 1.3;
  text-align: center;
`;

const RecordMeta = styled.div`
  color: ${PREVIEW_COLORS.textTertiary};
  font-family: ${theme.font.family};
  font-size: 13px;
  line-height: 1.4;
`;

const FieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldRow = styled.div<{ $index: number }>`
  align-items: flex-start;
  animation: fieldRowAppear 420ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${190 + $index * 70}ms`};
  display: flex;
  gap: 8px;
  min-height: 24px;

  @keyframes fieldRowAppear {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FieldMeta = styled.div`
  align-items: center;
  color: ${PREVIEW_COLORS.textTertiary};
  display: flex;
  flex: 0 0 110px;
  gap: 4px;
  min-height: 24px;
  min-width: 0;
`;

const FieldIcon = styled.span`
  align-items: center;
  color: ${PREVIEW_COLORS.textTertiary};
  display: flex;
  flex: 0 0 16px;
  height: 16px;
  justify-content: center;
  width: 16px;

  svg {
    display: block;
    height: 16px;
    width: 16px;
  }
`;

const FieldLabel = styled.span`
  color: ${PREVIEW_COLORS.textTertiary};
  font-family: ${theme.font.family};
  font-size: 13px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 90px;
`;

const MoreToggle = styled.div`
  align-items: center;
  color: ${PREVIEW_COLORS.textTertiary};
  cursor: default;
  display: flex;
  font-family: ${theme.font.family};
  font-size: 12px;
  gap: 4px;
  line-height: 1.4;
  padding: 4px 0;
`;

const Divider = styled.div`
  border-top: 1px solid ${PREVIEW_COLORS.borderLight};
  margin: 4px 0;
`;

const RelationSection = styled.div`
  animation: relationAppear 420ms ${EASING.standard} both;
  animation-delay: 600ms;
  display: flex;
  flex-direction: column;
  gap: 6px;

  @keyframes relationAppear {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const RelationTitle = styled.div`
  color: ${PREVIEW_COLORS.text};
  font-family: ${theme.font.family};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
`;

const RelationTitleCount = styled.span`
  color: ${PREVIEW_COLORS.textTertiary};
  font-weight: 400;
  margin-left: 4px;
`;

const RelationItem = styled.div<{ $highlighted?: boolean; $muted?: boolean }>`
  align-items: center;
  background: ${({ $highlighted }) =>
    $highlighted ? PREVIEW_COLORS.backgroundSecondary : 'transparent'};
  border: 1px solid
    ${({ $highlighted }) =>
      $highlighted ? PREVIEW_COLORS.border : 'transparent'};
  border-radius: 6px;
  display: flex;
  gap: 6px;
  opacity: ${({ $muted }) => ($muted ? 0.55 : 1)};
  padding: 2px 0;
  padding-inline: ${({ $highlighted }) => ($highlighted ? '6px' : '0')};
  transition:
    background 180ms ease,
    border-color 180ms ease,
    opacity 180ms ease;
`;

const RelationName = styled.span`
  color: ${PREVIEW_COLORS.text};
  font-family: ${theme.font.family};
  font-size: 12px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RelationAvatarImage = styled.img`
  border-radius: 50%;
  flex: 0 0 auto;
  height: 16px;
  object-fit: cover;
  width: 16px;
`;

const CenterPanel = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`;

const TabBar = styled.div`
  align-items: center;
  animation: tabBarAppear 260ms ease-out both;
  animation-delay: 120ms;
  border-bottom: 1px solid ${PREVIEW_COLORS.borderLight};
  display: flex;
  flex: 0 0 auto;
  gap: 4px;
  min-height: 40px;
  padding: 0 8px;

  @keyframes tabBarAppear {
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

const Tab = styled.div<{ $active?: boolean; $clickable?: boolean }>`
  all: unset;
  align-items: center;
  color: ${({ $active }) =>
    $active ? PREVIEW_COLORS.text : PREVIEW_COLORS.textSecondary};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  display: flex;
  position: relative;
  text-decoration: none;
  white-space: nowrap;

  &::after {
    background-color: ${({ $active }) =>
      $active ? PREVIEW_COLORS.text : 'transparent'};
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
    z-index: 1;
  }
`;

const TabInner = styled.span`
  display: flex;
  font-family: ${theme.font.family};
  font-size: 13px;
  font-weight: 500;
  gap: 4px;
  line-height: 1.4;
  padding: 4px 8px;
  border-radius: 4px;
  color: inherit;
`;

const { FieldIconGlyph, FieldValueRenderer } = recordFieldValue;

export function RecordPage({ page }: { page: RecordPageDefinition }) {
  const { record, notes, timeline, tasks, files, emails, calendar } = page;
  const availableTabs = recordTabs.getAvailable(page);
  const controlledTabLabel = page.activeTabLabel;
  const isControlled = controlledTabLabel !== undefined;
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    if (isControlled || isInteractive) {
      return undefined;
    }

    if (activeTabIndex >= availableTabs.length - 1) {
      setIsInteractive(true);
      return undefined;
    }

    const timer = setTimeout(() => {
      setActiveTabIndex((current) => current + 1);
    }, recordTabs.DWELL_MS);

    return () => clearTimeout(timer);
  }, [availableTabs.length, activeTabIndex, isControlled, isInteractive]);

  const activeTabLabel =
    controlledTabLabel ?? availableTabs[activeTabIndex]?.label ?? 'Notes';

  const handleTabClick = (label: string) => {
    if (!isInteractive) {
      return;
    }

    const nextIndex = availableTabs.findIndex((tab) => tab.label === label);

    if (nextIndex >= 0) {
      setActiveTabIndex(nextIndex);
    }
  };
  const hasHighlightedRelations = record.relations.some((section) =>
    section.items.some((item) => item.highlighted),
  );

  return (
    <Shell>
      <LeftPanel>
        <RecordHeader>
          <FaviconLogo
            domain={record.logoDomain}
            label={record.name}
            size={48}
          />
          <RecordName>{record.name}</RecordName>
          <RecordMeta>{record.createdAt}</RecordMeta>
        </RecordHeader>

        <FieldList>
          {record.fields.map((field, index) => (
            <FieldRow $index={index} key={field.label}>
              <FieldMeta>
                <FieldIcon>
                  {field.icon ? <FieldIconGlyph iconName={field.icon} /> : null}
                </FieldIcon>
                <FieldLabel>{field.label}</FieldLabel>
              </FieldMeta>
              <FieldValueRenderer field={field} />
            </FieldRow>
          ))}
        </FieldList>

        {record.moreCount ? (
          <MoreToggle>
            <IconChevronDown size={12} stroke={theme.icon.stroke.sm} />
            More ({record.moreCount})
          </MoreToggle>
        ) : null}

        <Divider />

        {record.relations.map((section) => (
          <RelationSection key={section.title}>
            <RelationTitle>
              {section.title}
              {section.count ? (
                <RelationTitleCount>All ({section.count})</RelationTitleCount>
              ) : null}
            </RelationTitle>
            {section.items.map((item) => (
              <RelationItem
                $highlighted={item.highlighted}
                $muted={hasHighlightedRelations && !item.highlighted}
                key={item.name}
              >
                {item.avatarUrl ? (
                  <RelationAvatarImage
                    alt={item.name}
                    fetchPriority="low"
                    src={item.avatarUrl}
                  />
                ) : (
                  <FaviconLogo
                    domain={item.domain}
                    label={item.name}
                    size={16}
                  />
                )}
                <RelationName>{item.name}</RelationName>
              </RelationItem>
            ))}
          </RelationSection>
        ))}
      </LeftPanel>

      <CenterPanel>
        <TabBar>
          {recordTabs.LIST.map((tab) => {
            const isActive = tab.label === activeTabLabel;

            return (
              <Tab
                key={tab.label}
                $active={isActive}
                $clickable={isInteractive}
                data-record-tab={tab.label}
                onClick={() => handleTabClick(tab.label)}
              >
                <TabInner>
                  <tab.Icon size={16} stroke={theme.icon.stroke.sm} />
                  {tab.label}
                </TabInner>
              </Tab>
            );
          })}
        </TabBar>

        {activeTabLabel === 'Timeline' && timeline ? (
          <RecordTimeline timeline={timeline} />
        ) : null}
        {activeTabLabel === 'Tasks' && tasks ? (
          <RecordTasks tasks={tasks} />
        ) : null}
        {activeTabLabel === 'Notes' ? <RecordNotes notes={notes} /> : null}
        {activeTabLabel === 'Files' && files ? (
          <RecordFiles files={files} />
        ) : null}
        {activeTabLabel === 'Emails' && emails ? (
          <RecordEmails emails={emails} />
        ) : null}
        {activeTabLabel === 'Calendar' && calendar ? (
          <RecordCalendar calendar={calendar} />
        ) : null}
      </CenterPanel>
    </Shell>
  );
}
