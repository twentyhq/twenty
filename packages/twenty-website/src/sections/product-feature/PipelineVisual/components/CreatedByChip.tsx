import { IconRobot } from '@tabler/icons-react';
import { type ReactNode } from 'react';

import { Chip } from '@/app-preview/primitives/Chip';
import { PersonAvatar } from '@/app-preview/primitives/PersonAvatar';

import { type DealActor } from '../types/deal-actor';

function renderCreatedByLeftComponent(actor: DealActor): ReactNode {
  if (actor.source === 'member') {
    return (
      <PersonAvatar
        person={{
          avatarUrl: actor.avatarUrl,
          kind: 'person',
          name: actor.name,
        }}
      />
    );
  }
  return <IconRobot size={16} stroke={1.6} />;
}

export function CreatedByChip({ actor }: { actor: DealActor }) {
  return (
    <Chip
      clickable={false}
      label={actor.name}
      leftComponent={renderCreatedByLeftComponent(actor)}
      variant="transparent"
    />
  );
}
