import { styled } from '@linaria/react';

import { PersonAvatar } from '../../primitives/person-avatar';
import { type RecordParticipant } from '../../types';

const AvatarStack = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const AvatarWrap = styled.div<{ $index: number }>`
  margin-left: ${({ $index }) => ($index === 0 ? '0' : '-4px')};
`;

export function AvatarGroup({
  people,
  size,
}: {
  people: RecordParticipant[];
  size: number;
}) {
  return (
    <AvatarStack>
      {people.slice(0, 3).map((person, index) => (
        <AvatarWrap $index={index} key={person.name}>
          <PersonAvatar person={{ ...person, kind: 'person' }} size={size} />
        </AvatarWrap>
      ))}
    </AvatarStack>
  );
}
