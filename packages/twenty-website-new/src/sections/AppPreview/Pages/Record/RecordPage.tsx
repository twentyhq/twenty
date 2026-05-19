'use client';

import { styled } from '@linaria/react';
import {
  IconCalendar,
  IconCheckbox,
  IconChevronDown,
  IconFile,
  IconMail,
  IconNotes,
  IconTimeline,
} from '@tabler/icons-react';

import type { RecordField, RecordPageDefinition } from '../../types';
import { FaviconLogo } from '../../Shared/components/FaviconLogo';
import {
  APP_FONT,
  COLORS,
  TABLER_STROKE,
} from '../../Shared/utils/app-preview-theme';
import { VISUAL_TOKENS } from '../../Shared/utils/app-preview-tokens';

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
  flex: 0 0 220px;
  flex-direction: column;
  gap: 12px;
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
  gap: 8px;
  padding-bottom: 4px;

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
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.text};
`;

const RecordMeta = styled.div`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 11px;
`;

const FieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldRow = styled.div<{ $index: number }>`
  align-items: center;
  animation: fieldRowAppear 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $index }) => `${190 + $index * 70}ms`};
  display: grid;
  gap: 8px;
  grid-template-columns: 14px 70px 1fr;
  min-height: 22px;

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

const FieldIcon = styled.span`
  align-items: center;
  color: ${COLORS.textTertiary};
  display: flex;
  justify-content: center;
`;

const FieldLabel = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FieldValue = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FieldValueChip = styled.span`
  background-color: ${VISUAL_TOKENS.background.transparent.lighter};
  border: 1px solid ${VISUAL_TOKENS.border.color.strong};
  border-radius: ${VISUAL_TOKENS.border.radius.pill};
  color: ${COLORS.text};
  display: inline-block;
  font-family: ${APP_FONT};
  font-size: 11px;
  line-height: 1;
  overflow: hidden;
  padding: 3px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: fit-content;
`;

const FieldValuePerson = styled.span`
  align-items: center;
  color: ${COLORS.text};
  display: flex;
  font-family: ${APP_FONT};
  font-size: 11px;
  gap: 4px;
`;

const MoreToggle = styled.div`
  align-items: center;
  color: ${COLORS.textTertiary};
  cursor: default;
  display: flex;
  font-family: ${APP_FONT};
  font-size: 11px;
  gap: 4px;
  padding: 2px 0;
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
  font-size: 11px;
  font-weight: 500;
`;

const RelationTitleCount = styled.span`
  color: ${COLORS.textTertiary};
  font-weight: 400;
  margin-left: 4px;
`;

const RelationItem = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  padding: 2px 0;
`;

const RelationName = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PersonAvatar = styled.img`
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
  gap: 0;
  padding: 0 16px;

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
  align-items: center;
  border-bottom: ${({ $active }) =>
    $active ? `2px solid ${COLORS.text}` : '2px solid transparent'};
  color: ${({ $active }) => ($active ? COLORS.text : COLORS.textTertiary)};
  cursor: default;
  display: flex;
  font-family: ${APP_FONT};
  font-size: 11px;
  font-weight: ${({ $active }) => ($active ? '500' : '400')};
  gap: 4px;
  padding: 8px 10px;
`;

const NotesHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 12px 16px 8px;
`;

const NotesCount = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 12px;
  font-weight: 500;
`;

const AddNoteButton = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 11px;
`;

const NotesGrid = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, 1fr);
  overflow-y: auto;
  padding: 0 16px 16px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const NoteCard = styled.div<{ $index: number }>`
  animation: noteCardAppear 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $index }) => `${400 + $index * 100}ms`};
  border: 1px solid ${COLORS.borderLight};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;

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

const NoteTitle = styled.div`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 12px;
  font-weight: 500;
`;

const NoteBody = styled.div`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
  color: ${COLORS.textSecondary};
  display: -webkit-box;
  font-family: ${APP_FONT};
  font-size: 11px;
  line-height: 1.5;
  overflow: hidden;
`;

const NoteRelation = styled.div`
  align-items: center;
  display: flex;
  gap: 5px;
  margin-top: 4px;
`;

const NoteRelationArrow = styled.svg`
  flex-shrink: 0;
  height: 10px;
  width: 10px;
`;

const NoteRelationLabel = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 10px;
  line-height: 14px;
`;

const NoteRelationName = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 10px;
  line-height: 14px;
`;

const NoteRelationAvatar = styled.img`
  border-radius: 50%;
  height: 14px;
  object-fit: cover;
  width: 14px;
`;

const RECORD_TABS = [
  { label: 'Timeline', Icon: IconTimeline },
  { label: 'Tasks', Icon: IconCheckbox },
  { label: 'Notes', Icon: IconNotes, active: true },
  { label: 'Files', Icon: IconFile },
  { label: 'Emails', Icon: IconMail },
  { label: 'Calendar', Icon: IconCalendar },
];

function FieldValueRenderer({ field }: { field: RecordField }) {
  if (field.avatarUrl) {
    return (
      <FieldValuePerson>
        <PersonAvatar
          alt={field.value}
          src={field.avatarUrl}
          style={{ width: 14, height: 14 }}
        />
        {field.value}
      </FieldValuePerson>
    );
  }
  if (field.value.includes('.com') || field.value.startsWith('@')) {
    return <FieldValueChip>{field.value}</FieldValueChip>;
  }
  return <FieldValue>{field.value}</FieldValue>;
}

export function RecordPage({ page }: { page: RecordPageDefinition }) {
  const { record, notes } = page;

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
              <FieldIcon>
                {field.icon ? (
                  <svg
                    fill="none"
                    height="12"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="12"
                  >
                    <FieldIconPath iconName={field.icon} />
                  </svg>
                ) : null}
              </FieldIcon>
              <FieldLabel>{field.label}</FieldLabel>
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
              <RelationItem key={item.name}>
                {item.avatarUrl ? (
                  <PersonAvatar alt={item.name} src={item.avatarUrl} />
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
          {RECORD_TABS.map((tab) => (
            <Tab key={tab.label} $active={tab.active}>
              <tab.Icon size={12} stroke={TABLER_STROKE} />
              {tab.label}
            </Tab>
          ))}
        </TabBar>

        <NotesHeader>
          <NotesCount>All {notes.length}</NotesCount>
          <AddNoteButton>+ Add note</AddNoteButton>
        </NotesHeader>

        <NotesGrid>
          {notes.map((note, index) => (
            <NoteCard $index={index} key={note.id}>
              <NoteTitle>{note.title}</NoteTitle>
              <NoteBody>{note.body}</NoteBody>
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
      </CenterPanel>
    </Shell>
  );
}

function FieldIconPath({ iconName }: { iconName: string }) {
  switch (iconName) {
    case 'link':
      return (
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      );
    case 'user':
      return (
        <>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </>
      );
    case 'mapPin':
      return (
        <>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </>
      );
    case 'check':
      return <path d="M20 6 9 17l-5-5" />;
    case 'currency':
      return (
        <>
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      );
    case 'linkedin':
      return (
        <>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect height="12" width="4" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </>
      );
    case 'twitter':
      return (
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      );
    default:
      return <circle cx="12" cy="12" r="1" />;
  }
}
