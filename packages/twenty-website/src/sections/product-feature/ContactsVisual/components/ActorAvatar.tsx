import { PersonAvatar } from '@/app-preview/primitives/PersonAvatar';

import { ACTOR_SOURCE_ICONS } from '../data/actor-source-icons';
import { type ContactActor } from '../types/contact-actor';

export function ActorAvatar({ actor }: { actor: ContactActor }) {
  if (actor.source) {
    const SourceIcon = ACTOR_SOURCE_ICONS[actor.source];
    return <SourceIcon size={14} stroke={1.6} />;
  }

  return (
    <PersonAvatar
      person={{
        avatarUrl: actor.avatarUrl,
        name: actor.name,
        tone: actor.tone,
      }}
    />
  );
}
