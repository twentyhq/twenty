'use client';

import { styled } from '@linaria/react';
import { IconArrowUpRight, IconPlus } from '@tabler/icons-react';

import { SHARED_PEOPLE_AVATAR_URLS } from '@/content/site/asset-paths';

import {
  BG_PANEL,
  BORDER_LIGHT,
  CARD_BORDER,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
  CARD_TEXT_TERTIARY,
} from '../visual-tokens';
import { RelAvatar, RelChip } from './record-tab-shared';

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

export function NotesTab() {
  return (
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
  );
}
