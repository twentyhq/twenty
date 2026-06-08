'use client';

import { styled } from '@linaria/react';
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCalendarEvent,
  IconCheck,
  IconChevronDown,
  IconCirclePlus,
  IconCopy,
  IconLink,
  IconPaperclip,
  IconPlus,
} from '@tabler/icons-react';
import { useState } from 'react';

import { SHARED_PEOPLE_AVATAR_URLS } from '@/content/site/asset-paths';

import { RecordTabBar } from './RecordTabBar';
import {
  BG_DARK,
  BG_PANEL,
  BORDER_LIGHT,
  CARD_ACCENT,
  CARD_BORDER,
  CARD_FONT,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
  CARD_TEXT_TERTIARY,
  TEXT_LIGHT,
} from './visual-tokens';

const Root = styled.div`
  background-color: ${BG_DARK};
  display: flex;
  flex-direction: column;
  font-family: ${CARD_FONT};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

// --- Timeline (mirrors twenty-front EventsGroup + EventRow) ----------------

const EventList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 16px 18px 0;
`;

const MonthSeparator = styled.div`
  align-items: center;
  color: ${TEXT_LIGHT};
  display: flex;
  font-size: 11px;
  font-weight: 600;
  gap: 12px;
  margin-bottom: 16px;
`;

const MonthSeparatorLine = styled.div`
  background: ${BORDER_LIGHT};
  border-radius: 50px;
  flex: 1;
  height: 1px;
`;

const Group = styled.div`
  position: relative;
`;

const RailBar = styled.div`
  background: ${BG_PANEL};
  border: 1px solid ${BORDER_LIGHT};
  border-radius: 8px;
  bottom: 14px;
  left: 0;
  position: absolute;
  top: 3px;
  width: 24px;
`;

const EventRow = styled.div`
  align-items: center;
  display: flex;
  gap: 14px;
  padding-bottom: 16px;

  &:last-child {
    padding-bottom: 4px;
  }
`;

const EventRail = styled.div`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  width: 24px;
  z-index: 1;

  svg {
    height: 15px;
    width: 15px;
  }
`;

const EventContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 4px;
  min-width: 0;
`;

const EvBold = styled.span`
  color: ${CARD_TEXT};
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
`;

const EvText = styled.span`
  color: ${CARD_TEXT_SECONDARY};
  flex-shrink: 0;
  font-size: 12px;
  white-space: nowrap;
`;

const EvArrow = styled.span`
  align-items: center;
  color: ${CARD_TEXT_SECONDARY};
  display: inline-flex;
  flex-shrink: 0;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const EvChip = styled.span`
  align-items: center;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 4px;
  color: ${CARD_TEXT};
  display: inline-flex;
  flex-shrink: 0;
  font-size: 12px;
  gap: 4px;
  padding: 1px 5px 1px 3px;
`;

const EvChipChevron = styled.span`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: inline-flex;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const EvTime = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  flex-shrink: 0;
  font-size: 11px;
  margin-left: auto;
  padding-left: 12px;
  white-space: nowrap;
`;

// --- Tasks (mirrors twenty-front TaskRow + Checkbox) ----------------------

const TasksView = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow: hidden;
  padding: 14px 12px;
`;

const TaskSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TaskSectionHeader = styled.div`
  align-items: center;
  color: ${TEXT_LIGHT};
  display: flex;
  font-size: 11px;
  font-weight: 600;
  gap: 6px;
  padding: 0 8px 6px;
`;

const TaskCount = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-weight: 500;
`;

const TaskRow = styled.div`
  align-items: center;
  border-radius: 6px;
  display: flex;
  gap: 10px;
  padding: 8px;
`;

const TaskLeft = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
`;

const TaskCheckbox = styled.span`
  align-items: center;
  background: transparent;
  border: 1px solid ${CARD_TEXT_SECONDARY};
  border-radius: 4px;
  color: #ffffff;
  display: flex;
  flex-shrink: 0;
  height: 15px;
  justify-content: center;
  width: 15px;

  svg {
    height: 11px;
    width: 11px;
  }

  &[data-done='true'] {
    background: ${CARD_ACCENT};
    border-color: ${CARD_ACCENT};
  }
`;

const TaskTitle = styled.span`
  color: ${CARD_TEXT};
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-done='true'] {
    color: ${CARD_TEXT_TERTIARY};
    text-decoration: line-through;
  }
`;

const TaskBody = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TaskRight = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  padding-left: 10px;
`;

const TaskDue = styled.span`
  align-items: center;
  color: ${CARD_TEXT_SECONDARY};
  display: flex;
  flex-shrink: 0;
  font-size: 11px;
  gap: 4px;
  white-space: nowrap;

  svg {
    height: 13px;
    width: 13px;
  }
`;

// --- Notes (mirrors twenty-front NoteTile) --------------------------------

const NotesView = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const NotesHead = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  padding: 14px 16px 10px;
`;

const NotesHeadLeft = styled.div`
  align-items: baseline;
  display: flex;
  gap: 6px;
`;

const NotesHeadAll = styled.span`
  color: ${CARD_TEXT};
  font-size: 13px;
  font-weight: 600;
`;

const NotesHeadCount = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 13px;
`;

const AddNoteBtn = styled.span`
  align-items: center;
  border: 1px solid ${CARD_BORDER};
  border-radius: 6px;
  color: ${CARD_TEXT_SECONDARY};
  display: inline-flex;
  font-size: 11px;
  gap: 4px;
  padding: 4px 8px;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const NoteGrid = styled.div`
  display: grid;
  flex: 1;
  gap: 10px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  min-height: 0;
  overflow: hidden;
  padding: 0 16px 16px;
`;

const NoteCard = styled.div`
  align-items: flex-start;
  background: ${BG_PANEL};
  border: 1px solid ${CARD_BORDER};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  overflow: hidden;
`;

const NoteCardBodyArea = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow: hidden;
  padding: 12px;
`;

const NoteCardTitle = styled.div`
  color: ${CARD_TEXT};
  font-size: 12px;
  font-weight: 500;
`;

const NoteCardBody = styled.div`
  color: ${CARD_TEXT_SECONDARY};
  flex: 1;
  font-size: 11px;
  line-break: anywhere;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line;
  width: 100%;
`;

const NoteCardFooter = styled.div`
  align-items: center;
  align-self: stretch;
  border-top: 1px solid ${BORDER_LIGHT};
  display: flex;
  gap: 6px;
  overflow: hidden;
  padding: 8px 12px;
`;

const RelLabel = styled.span`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: inline-flex;
  flex-shrink: 0;
  font-size: 11px;
  gap: 3px;

  svg {
    height: 12px;
    width: 12px;
  }
`;

const RelChip = styled.span`
  align-items: center;
  color: ${CARD_TEXT_SECONDARY};
  display: inline-flex;
  font-size: 11px;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RelAvatar = styled.img`
  border-radius: 999px;
  flex-shrink: 0;
  height: 14px;
  object-fit: cover;
  width: 14px;
`;

type EventPart = {
  bold?: boolean;
  text?: string;
  chip?: { name: string; avatar: string };
  chevron?: boolean;
  arrow?: boolean;
};

const TIMELINE: {
  icon: typeof IconCopy;
  time: string;
  parts: EventPart[];
}[] = [
  {
    icon: IconCopy,
    time: '2 days ago',
    parts: [
      { bold: true, text: 'Alice' },
      { text: 'edited 3 fields on' },
      {
        chip: {
          name: 'Dario Amodei',
          avatar: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
        },
        chevron: true,
      },
    ],
  },
  {
    icon: IconPaperclip,
    time: '12 days ago',
    parts: [
      { bold: true, text: 'Tim Cook' },
      { text: 'updated' },
      { bold: true, text: 'Owner' },
      { arrow: true },
      {
        chip: {
          name: 'Patrick Collison',
          avatar: SHARED_PEOPLE_AVATAR_URLS.patrickCollison,
        },
      },
    ],
  },
  {
    icon: IconLink,
    time: '23 days ago',
    parts: [
      { bold: true, text: 'Tim Cook' },
      { text: 'linked' },
      {
        chip: {
          name: 'Dario Amodei',
          avatar: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
        },
      },
      { text: 'to' },
      { bold: true, text: 'Anthropic' },
    ],
  },
  {
    icon: IconCirclePlus,
    time: '42 days ago',
    parts: [
      { bold: true, text: 'Anthropic' },
      { text: 'was created by' },
      { bold: true, text: 'Tim Cook' },
    ],
  },
];

const TASKS = [
  {
    status: 'TODO',
    title: 'Send NDA',
    body: 'Loop in legal before sending.',
    due: 'Tomorrow',
    person: {
      name: 'Dario Amodei',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
    },
  },
  {
    status: 'TODO',
    title: 'Follow up on pricing',
    body: 'Send the updated annual quote.',
    due: 'Jul 24',
    person: {
      name: 'Patrick Collison',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.patrickCollison,
    },
  },
  {
    status: 'TODO',
    title: 'Onboarding deck',
    body: 'Use the Q3 template.',
    due: 'Jul 26',
    person: {
      name: 'Dylan Field',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.dylanField,
    },
  },
  {
    status: 'DONE',
    title: 'Schedule security review',
    body: 'Coordinated with the data team.',
    due: 'Jul 18',
    person: {
      name: 'Dario Amodei',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
    },
  },
];

const NOTES = [
  {
    title: 'Kickoff with Dario',
    body: 'Aligned on the rollout timeline and the security review. Dario to share the enterprise checklist by Friday.',
    person: {
      name: 'Dario Amodei',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
    },
  },
  {
    title: 'Pricing questions',
    body: 'Wants annual billing with a volume discount above 500 seats. Send the updated quote before the next call.',
    person: {
      name: 'Patrick Collison',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.patrickCollison,
    },
  },
  {
    title: 'Integration scope',
    body: 'Reviewed the API surface. Next steps: SSO setup and a pilot with the data team.',
    person: {
      name: 'Dylan Field',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.dylanField,
    },
  },
];

type TasksVisualProps = {
  active: boolean;
};

export function TasksVisual({ active: _active }: TasksVisualProps) {
  const [tab, setTab] = useState('Tasks');

  return (
    <Root>
      <RecordTabBar
        active={tab}
        onSelect={setTab}
        switchable={['Timeline', 'Tasks', 'Notes']}
      />

      <Body>
        {tab === 'Tasks' ? (
          <TasksView>
            {[
              {
                label: 'To do',
                items: TASKS.filter((task) => task.status === 'TODO'),
              },
              {
                label: 'Done',
                items: TASKS.filter((task) => task.status === 'DONE'),
              },
            ].map((group) => (
              <TaskSection key={group.label}>
                <TaskSectionHeader>
                  {group.label}
                  <TaskCount>{group.items.length}</TaskCount>
                </TaskSectionHeader>
                {group.items.map((task) => {
                  const done = task.status === 'DONE';
                  return (
                    <TaskRow key={task.title}>
                      <TaskLeft>
                        <TaskCheckbox data-done={done}>
                          {done ? <IconCheck /> : null}
                        </TaskCheckbox>
                        <TaskTitle data-done={done}>{task.title}</TaskTitle>
                        <TaskBody>{task.body}</TaskBody>
                      </TaskLeft>
                      <TaskRight>
                        <TaskDue>
                          <IconCalendarEvent />
                          {task.due}
                        </TaskDue>
                        <RelChip>
                          <RelAvatar alt="" src={task.person.avatarUrl} />
                          {task.person.name}
                        </RelChip>
                      </TaskRight>
                    </TaskRow>
                  );
                })}
              </TaskSection>
            ))}
          </TasksView>
        ) : tab === 'Notes' ? (
          <NotesView>
            <NotesHead>
              <NotesHeadLeft>
                <NotesHeadAll>All</NotesHeadAll>
                <NotesHeadCount>{NOTES.length}</NotesHeadCount>
              </NotesHeadLeft>
              <AddNoteBtn>
                <IconPlus />
                Add note
              </AddNoteBtn>
            </NotesHead>
            <NoteGrid>
              {NOTES.map((note) => (
                <NoteCard key={note.title}>
                  <NoteCardBodyArea>
                    <NoteCardTitle>{note.title}</NoteCardTitle>
                    <NoteCardBody>{note.body}</NoteCardBody>
                  </NoteCardBodyArea>
                  <NoteCardFooter>
                    <RelLabel>
                      <IconArrowUpRight />
                      Relations:
                    </RelLabel>
                    <RelChip>
                      <RelAvatar alt="" src={note.person.avatarUrl} />
                      {note.person.name}
                    </RelChip>
                  </NoteCardFooter>
                </NoteCard>
              ))}
            </NoteGrid>
          </NotesView>
        ) : (
          <EventList>
            <MonthSeparator>
              July
              <MonthSeparatorLine />
            </MonthSeparator>
            <Group>
              <RailBar />
              {TIMELINE.map((event, index) => {
                const EventIcon = event.icon;
                return (
                  <EventRow key={index}>
                    <EventRail>
                      <EventIcon />
                    </EventRail>
                    <EventContent>
                      {event.parts.map((part, partIndex) => {
                        if (part.chip) {
                          return (
                            <EvChip key={partIndex}>
                              <RelAvatar alt="" src={part.chip.avatar} />
                              {part.chip.name}
                              {part.chevron ? (
                                <EvChipChevron>
                                  <IconChevronDown />
                                </EvChipChevron>
                              ) : null}
                            </EvChip>
                          );
                        }
                        if (part.arrow) {
                          return (
                            <EvArrow key={partIndex}>
                              <IconArrowRight />
                            </EvArrow>
                          );
                        }
                        if (part.bold) {
                          return <EvBold key={partIndex}>{part.text}</EvBold>;
                        }
                        return <EvText key={partIndex}>{part.text}</EvText>;
                      })}
                      <EvTime>{event.time}</EvTime>
                    </EventContent>
                  </EventRow>
                );
              })}
            </Group>
          </EventList>
        )}
      </Body>
    </Root>
  );
}
