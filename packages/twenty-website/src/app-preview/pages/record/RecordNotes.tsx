import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { EASING } from '@/tokens';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { type RecordNote } from '../../types';

const NotesHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  margin-top: 16px;
  padding: 0 24px;
`;

const NotesCount = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: var(--font-product), sans-serif;
  font-size: 13px;
  font-weight: 600;
`;

const AddNoteButton = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-family: var(--font-product), sans-serif;
  font-size: 13px;
  line-height: 1.4;
`;

const NotesGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  overflow-y: auto;
  padding: 0 24px 24px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const NoteCard = styled.div<{
  $highlighted?: boolean;
  $index: number;
  $muted?: boolean;
}>`
  animation: noteCardAppear 360ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${120 + $index * 70}ms`};
  background: ${({ $highlighted }) =>
    $highlighted
      ? THEME_LIGHT.background.primary
      : THEME_LIGHT.background.secondary};
  border: 1px solid
    ${({ $highlighted }) =>
      $highlighted
        ? THEME_LIGHT.border.color.medium
        : THEME_LIGHT.border.color.light};
  border-radius: ${THEME_LIGHT.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 300px;
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
    $highlighted ? APP_PREVIEW_TONES.recordNoteHighlightShadow : 'none'};

  @keyframes noteCardAppear {
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

const NoteContent = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding: 16px;
`;

const NoteTitle = styled.div`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: var(--font-product), sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
`;

const NoteBody = styled.div`
  color: ${THEME_LIGHT.font.color.secondary};
  font-family: var(--font-product), sans-serif;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line;
`;

const NoteRelation = styled.div`
  align-items: center;
  border-top: 1px solid ${THEME_LIGHT.border.color.light};
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
  color: ${THEME_LIGHT.font.color.tertiary};
  font-family: var(--font-product), sans-serif;
  font-size: 12px;
  line-height: 1.4;
`;

const NoteRelationName = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: var(--font-product), sans-serif;
  font-size: 12px;
  line-height: 1.4;
`;

const NoteRelationAvatar = styled.img`
  border-radius: 50%;
  height: 16px;
  object-fit: cover;
  width: 16px;
`;

export function RecordNotes({ notes }: { notes: RecordNote[] }) {
  const hasHighlightedNotes = notes.some((note) => note.highlighted);

  return (
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
                  stroke={THEME_LIGHT.font.color.tertiary}
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
                    fetchPriority="low"
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
  );
}
