import { Chip } from '@/app-preview/primitives/Chip';
import { PersonAvatar } from '@/app-preview/primitives/PersonAvatar';

import { type DealPerson } from '../deal-types';

export function DealPersonChip({ person }: { person: DealPerson }) {
  return (
    <Chip
      clickable={false}
      label={person.name}
      leftComponent={
        <PersonAvatar
          person={{ avatarUrl: person.avatarUrl, name: person.name }}
        />
      }
      maxWidth={152}
      variant="highlighted"
    />
  );
}
