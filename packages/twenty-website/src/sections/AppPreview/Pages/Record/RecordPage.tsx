'use client';

import { styled } from '@linaria/react';
import {
  IconBrandLinkedin,
  IconBrandX,
  IconCalendarEvent,
  IconCheckbox,
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconCirclePlus,
  IconCurrencyDollar,
  IconEditCircle,
  IconLink,
  IconMail,
  IconMapPin,
  IconNotes,
  IconPaperclip,
  IconTimelineEvent,
  IconUser,
} from '@tabler/icons-react';

import type {
  RecordField,
  RecordFieldValue,
  RecordPageDefinition,
  TimelineEvent,
} from '../../types';
import { FaviconLogo } from '../../Shared/components/FaviconLogo';
import { PersonAvatar } from '../../Shared/components/PersonAvatar';
import { PreviewRoundedLink } from '../../Shared/components/PreviewRoundedLink';
import { PreviewTag } from '../../Shared/components/PreviewTag';
import {
  APP_FONT,
  COLORS,
  TABLER_STROKE,
} from '../../Shared/utils/app-preview-theme';

const Shell = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const LeftPanel = styled.div`
  border-right: 1px solid ${COLORS.borderLight};
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
  animation: recordHeaderAppear 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
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
  font-family: ${APP_FONT};
  font-size: 20px;
  font-weight: 600;
  color: ${COLORS.text};
  line-height: 1.3;
  text-align: center;
`;

const RecordMeta = styled.div`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
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
  animation: fieldRowAppear 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
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
  color: ${COLORS.textTertiary};
  display: flex;
  flex: 0 0 110px;
  gap: 4px;
  min-height: 24px;
  min-width: 0;
`;

const FieldIcon = styled.span`
  align-items: center;
  color: ${COLORS.textTertiary};
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
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 13px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 90px;
`;

const FieldValueSlot = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-height: 24px;
  min-width: 0;
`;

const FieldValue = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 13px;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FieldValuePerson = styled.span`
  align-items: center;
  color: ${COLORS.text};
  display: flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  gap: 4px;
  line-height: 1.4;
  min-width: 0;
`;

const FieldValuePersonName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MoreToggle = styled.div`
  align-items: center;
  color: ${COLORS.textTertiary};
  cursor: default;
  display: flex;
  font-family: ${APP_FONT};
  font-size: 12px;
  gap: 4px;
  line-height: 1.4;
  padding: 4px 0;
`;

const Divider = styled.div`
  border-top: 1px solid ${COLORS.borderLight};
  margin: 4px 0;
`;

const RelationSection = styled.div`
  animation: relationAppear 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
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
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
`;

const RelationTitleCount = styled.span`
  color: ${COLORS.textTertiary};
  font-weight: 400;
  margin-left: 4px;
`;

const RelationItem = styled.div<{ $highlighted?: boolean; $muted?: boolean }>`
  align-items: center;
  background: ${({ $highlighted }) =>
    $highlighted ? COLORS.backgroundSecondary : 'transparent'};
  border: 1px solid
    ${({ $highlighted }) => ($highlighted ? COLORS.border : 'transparent')};
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
  color: ${COLORS.text};
  font-family: ${APP_FONT};
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
  border-bottom: 1px solid ${COLORS.borderLight};
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

const Tab = styled.div<{ $active?: boolean }>`
  all: unset;
  align-items: center;
  color: ${({ $active }) => ($active ? COLORS.text : COLORS.textSecondary)};
  display: flex;
  position: relative;
  text-decoration: none;
  white-space: nowrap;

  &::after {
    background-color: ${({ $active }) =>
      $active ? COLORS.text : 'transparent'};
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
    z-index: 1;
  }
`;

const TabInner = styled.span<{ $active?: boolean }>`
  display: flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: 500;
  gap: 4px;
  line-height: 1.4;
  padding: 4px 8px;
  border-radius: 4px;

  color: inherit;
`;

const NotesHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  margin-top: 16px;
  padding: 0 24px;
`;

const NotesCount = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: 600;
`;

const AddNoteButton = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 13px;
  line-height: 1.4;
`;

const NotesGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-auto-rows: 1fr;
  grid-template-columns: minmax(0, 1fr);
  overflow-y: auto;
  padding: 0 24px 24px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const NoteCard = styled.div<{
  $highlighted?: boolean;
  $index: number;
  $muted?: boolean;
}>`
  animation: noteCardAppear 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $index }) => `${400 + $index * 100}ms`};
  background: ${({ $highlighted }) =>
    $highlighted ? COLORS.background : COLORS.backgroundSecondary};
  border: 1px solid
    ${({ $highlighted }) => ($highlighted ? COLORS.border : COLORS.borderLight)};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 280px;
  justify-content: space-between;
  opacity: ${({ $muted }) => ($muted ? 0.56 : 1)};
  transform: ${({ $highlighted }) =>
    $highlighted ? 'translateY(-2px)' : 'none'};
  transition:
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    opacity 180ms ease,
    transform 180ms ease;
  box-shadow: ${({ $highlighted }) =>
    $highlighted ? '0 4px 14px rgba(0, 0, 0, 0.06)' : 'none'};

  @keyframes noteCardAppear {
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

const NoteContent = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding: 16px;
`;

const NoteTitle = styled.div`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
`;

const NoteBody = styled.div`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line;
`;

const NoteRelation = styled.div`
  align-items: center;
  border-top: 1px solid ${COLORS.borderLight};
  display: flex;
  gap: 6px;
  justify-content: center;
  min-height: 37px;
  padding: 8px;
`;

const NoteRelationArrow = styled.svg`
  flex-shrink: 0;
  height: 10px;
  width: 10px;
`;

const NoteRelationLabel = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 12px;
  line-height: 1.4;
`;

const NoteRelationName = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 12px;
  line-height: 1.4;
`;

const NoteRelationAvatar = styled.img`
  border-radius: 50%;
  height: 16px;
  object-fit: cover;
  width: 16px;
`;

const TimelineFeed = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 16px 24px 24px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MonthSeparator = styled.div`
  align-items: center;
  color: ${COLORS.textLight};
  display: flex;
  font-family: ${APP_FONT};
  font-size: 12px;
  font-weight: 600;
  gap: 16px;
  margin-bottom: 16px;
`;

const MonthSeparatorLine = styled.div`
  background: ${COLORS.borderLight};
  border-radius: 50px;
  flex: 1;
  height: 1px;
`;

const TimelineRow = styled.div<{ $index: number }>`
  animation: timelineRowAppear 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $index }) => `${400 + $index * 100}ms`};
  display: flex;
  gap: 12px;

  @keyframes timelineRowAppear {
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

const TimelineGutter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const TimelineIconBox = styled.div`
  align-items: center;
  color: ${COLORS.textTertiary};
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const TimelineConnector = styled.div<{ $hidden: boolean }>`
  background: ${COLORS.borderLight};
  flex: 1;
  margin: 4px 0;
  min-height: 12px;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  width: 2px;
`;

const TimelineMain = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding-bottom: 16px;
`;

const TimelineSummary = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  justify-content: space-between;
  min-height: 24px;
`;

const TimelineSummaryLeft = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
`;

const TimelineActor = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
`;

const TimelineAction = styled.span`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 13px;
  white-space: nowrap;
`;

const TimelineSubject = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
`;

const TimelineDiffLabel = styled.span`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 13px;
  white-space: nowrap;
`;

const TimelineArrow = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 13px;
`;

const TimelineValueText = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 13px;
  white-space: nowrap;
`;

const TimelineDiffPerson = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 4px;
`;

const TimelineLinkedTitle = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 13px;
  overflow: hidden;
  text-decoration: underline;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TimelineTime = styled.span`
  color: ${COLORS.textTertiary};
  flex-shrink: 0;
  font-family: ${APP_FONT};
  font-size: 13px;
  padding-left: 8px;
  white-space: nowrap;
`;

const TimelineToggle = styled.span`
  align-items: center;
  border: 1px solid ${COLORS.borderLight};
  border-radius: 4px;
  color: ${COLORS.textTertiary};
  display: inline-flex;
  flex-shrink: 0;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const TimelineCardOuter = styled.div`
  max-width: 360px;
  padding-top: 2px;
  width: 100%;
`;

const TimelineCardInner = styled.div`
  background: ${COLORS.backgroundSecondary};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
`;

const TimelineDiffRow = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-height: 24px;
`;

const TimelineCardTitle = styled.div`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: 500;
`;

const TimelineCardText = styled.div`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 13px;
  line-height: 1.4;
`;

function TimelineEventIcon({ kind }: { kind: TimelineEvent['kind'] }) {
  switch (kind) {
    case 'created':
      return <IconCirclePlus size={16} stroke={TABLER_STROKE} />;
    case 'updated':
      return <IconEditCircle size={16} stroke={TABLER_STROKE} />;
    case 'note':
      return <IconNotes size={16} stroke={TABLER_STROKE} />;
    case 'calendar':
      return <IconCalendarEvent size={16} stroke={TABLER_STROKE} />;
    default:
      return null;
  }
}

function TimelineDiffValue({ value }: { value: RecordFieldValue }) {
  switch (value.type) {
    case 'select':
      return <PreviewTag color={value.color} label={value.value} />;
    case 'person':
      return (
        <TimelineDiffPerson>
          <PersonAvatar person={value} size={16} />
          <TimelineValueText>{value.name}</TimelineValueText>
        </TimelineDiffPerson>
      );
    case 'boolean':
      return (
        <TimelineValueText>{value.value ? 'True' : 'False'}</TimelineValueText>
      );
    case 'currency':
    case 'text':
      return <TimelineValueText>{value.value}</TimelineValueText>;
    case 'link':
      return (
        <TimelineValueText>{value.label ?? value.value}</TimelineValueText>
      );
    default:
      return null;
  }
}

function TimelineEventSummary({ event }: { event: TimelineEvent }) {
  switch (event.kind) {
    case 'created':
      return (
        <>
          <TimelineSubject>{event.subject}</TimelineSubject>
          <TimelineAction>was created by</TimelineAction>
          <TimelineActor>{event.actor}</TimelineActor>
        </>
      );
    case 'note':
      return (
        <>
          <TimelineActor>{event.actor}</TimelineActor>
          <TimelineAction>created a note</TimelineAction>
          <TimelineLinkedTitle>{event.title}</TimelineLinkedTitle>
        </>
      );
    case 'calendar':
      return (
        <>
          <TimelineActor>{event.actor}</TimelineActor>
          <TimelineAction>added a calendar event</TimelineAction>
          <TimelineSubject>{event.title}</TimelineSubject>
          <TimelineToggle>
            <IconChevronUp size={12} stroke={TABLER_STROKE} />
          </TimelineToggle>
        </>
      );
    case 'updated':
      if (event.diffs.length === 1) {
        return (
          <>
            <TimelineActor>{event.actor}</TimelineActor>
            <TimelineAction>updated</TimelineAction>
            <TimelineDiffLabel>{event.diffs[0].label}</TimelineDiffLabel>
            <TimelineArrow>→</TimelineArrow>
            <TimelineDiffValue value={event.diffs[0].value} />
          </>
        );
      }

      return (
        <>
          <TimelineActor>{event.actor}</TimelineActor>
          <TimelineAction>updated</TimelineAction>
          <TimelineSubject>
            {event.diffs.length} fields on {event.record}
          </TimelineSubject>
          <TimelineToggle>
            <IconChevronUp size={12} stroke={TABLER_STROKE} />
          </TimelineToggle>
        </>
      );
    default:
      return null;
  }
}

function TimelineEventCard({ event }: { event: TimelineEvent }) {
  if (event.kind === 'updated' && event.diffs.length > 1) {
    return (
      <TimelineCardOuter>
        <TimelineCardInner>
          {event.diffs.map((diff) => (
            <TimelineDiffRow key={diff.label}>
              <TimelineDiffLabel>{diff.label}</TimelineDiffLabel>
              <TimelineArrow>→</TimelineArrow>
              <TimelineDiffValue value={diff.value} />
            </TimelineDiffRow>
          ))}
        </TimelineCardInner>
      </TimelineCardOuter>
    );
  }

  if (event.kind === 'calendar') {
    return (
      <TimelineCardOuter>
        <TimelineCardInner>
          <TimelineCardTitle>{event.title}</TimelineCardTitle>
          <TimelineCardText>{event.detail}</TimelineCardText>
        </TimelineCardInner>
      </TimelineCardOuter>
    );
  }

  return null;
}

const RECORD_TABS = [
  { label: 'Timeline', Icon: IconTimelineEvent },
  { label: 'Tasks', Icon: IconCheckbox },
  { label: 'Notes', Icon: IconNotes },
  { label: 'Files', Icon: IconPaperclip },
  { label: 'Emails', Icon: IconMail },
  { label: 'Calendar', Icon: IconCalendarEvent },
];

function FieldValueRenderer({ field }: { field: RecordField }) {
  switch (field.value.type) {
    case 'text':
      return (
        <FieldValueSlot>
          <FieldValue>{field.value.value}</FieldValue>
        </FieldValueSlot>
      );
    case 'boolean':
      return (
        <FieldValueSlot>
          <FieldValue>{field.value.value ? 'True' : 'False'}</FieldValue>
        </FieldValueSlot>
      );
    case 'currency':
      return (
        <FieldValueSlot>
          <FieldValue>{field.value.value}</FieldValue>
        </FieldValueSlot>
      );
    case 'link':
      return (
        <FieldValueSlot>
          <PreviewRoundedLink label={field.value.label ?? field.value.value} />
        </FieldValueSlot>
      );
    case 'person':
      return (
        <FieldValueSlot>
          <FieldValuePerson>
            <PersonAvatar person={field.value} size={16} />
            <FieldValuePersonName>{field.value.name}</FieldValuePersonName>
          </FieldValuePerson>
        </FieldValueSlot>
      );
    case 'select':
      return (
        <FieldValueSlot>
          <PreviewTag color={field.value.color} label={field.value.value} />
        </FieldValueSlot>
      );
    default:
      return null;
  }
}

export function RecordPage({ page }: { page: RecordPageDefinition }) {
  const { record, notes, timeline } = page;
  const activeTabLabel = timeline ? 'Timeline' : 'Notes';
  const hasHighlightedNotes = notes.some((note) => note.highlighted);
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
            <IconChevronDown size={12} stroke={TABLER_STROKE} />
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
                  <RelationAvatarImage alt={item.name} src={item.avatarUrl} />
                ) : item.domain ? (
                  <FaviconLogo
                    domain={item.domain}
                    label={item.name}
                    size={16}
                  />
                ) : (
                  <FaviconLogo label={item.name} size={16} />
                )}
                <RelationName>{item.name}</RelationName>
              </RelationItem>
            ))}
          </RelationSection>
        ))}
      </LeftPanel>

      <CenterPanel>
        <TabBar>
          {RECORD_TABS.map((tab) => {
            const isActive = tab.label === activeTabLabel;

            return (
              <Tab key={tab.label} $active={isActive}>
                <TabInner $active={isActive}>
                  <tab.Icon size={16} stroke={TABLER_STROKE} />
                  {tab.label}
                </TabInner>
              </Tab>
            );
          })}
        </TabBar>

        {timeline ? (
          <TimelineFeed>
            <MonthSeparator>
              Today
              <MonthSeparatorLine />
            </MonthSeparator>
            {timeline.map((event, index) => (
              <TimelineRow $index={index} key={event.id}>
                <TimelineGutter>
                  <TimelineIconBox>
                    <TimelineEventIcon kind={event.kind} />
                  </TimelineIconBox>
                  <TimelineConnector $hidden={index === timeline.length - 1} />
                </TimelineGutter>
                <TimelineMain>
                  <TimelineSummary>
                    <TimelineSummaryLeft>
                      <TimelineEventSummary event={event} />
                    </TimelineSummaryLeft>
                    <TimelineTime>{event.time}</TimelineTime>
                  </TimelineSummary>
                  <TimelineEventCard event={event} />
                </TimelineMain>
              </TimelineRow>
            ))}
          </TimelineFeed>
        ) : (
          <>
            <NotesHeader>
              <NotesCount>All {notes.length}</NotesCount>
              <AddNoteButton>+ Add note</AddNoteButton>
            </NotesHeader>

            <NotesGrid>
              {notes.map((note, index) => (
                <NoteCard
                  $highlighted={note.highlighted}
                  $index={index}
                  $muted={hasHighlightedNotes && !note.highlighted}
                  key={note.id}
                >
                  <NoteContent>
                    <NoteTitle>{note.title}</NoteTitle>
                    <NoteBody>{note.body}</NoteBody>
                  </NoteContent>
                  {note.relation ? (
                    <NoteRelation>
                      <NoteRelationArrow
                        fill="none"
                        stroke={COLORS.textTertiary}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        viewBox="0 0 12 12"
                      >
                        <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" />
                      </NoteRelationArrow>
                      <NoteRelationLabel>Relations:</NoteRelationLabel>
                      {note.relation.avatarUrl ? (
                        <NoteRelationAvatar
                          alt={note.relation.name}
                          src={note.relation.avatarUrl}
                        />
                      ) : null}
                      <NoteRelationName>{note.relation.name}</NoteRelationName>
                    </NoteRelation>
                  ) : null}
                </NoteCard>
              ))}
            </NotesGrid>
          </>
        )}
      </CenterPanel>
    </Shell>
  );
}

function FieldIconGlyph({ iconName }: { iconName: string }) {
  switch (iconName) {
    case 'link':
      return <IconLink aria-hidden size={16} stroke={TABLER_STROKE} />;
    case 'user':
      return <IconUser aria-hidden size={16} stroke={TABLER_STROKE} />;
    case 'mapPin':
      return <IconMapPin aria-hidden size={16} stroke={TABLER_STROKE} />;
    case 'check':
      return <IconCheck aria-hidden size={16} stroke={TABLER_STROKE} />;
    case 'currency':
      return (
        <IconCurrencyDollar aria-hidden size={16} stroke={TABLER_STROKE} />
      );
    case 'linkedin':
      return <IconBrandLinkedin aria-hidden size={16} stroke={TABLER_STROKE} />;
    case 'twitter':
      return <IconBrandX aria-hidden size={16} stroke={TABLER_STROKE} />;
    default:
      return null;
  }
}
