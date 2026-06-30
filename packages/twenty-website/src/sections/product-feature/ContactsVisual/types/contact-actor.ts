type ContactTone = 'amber' | 'blue' | 'gray' | 'pink' | 'purple' | 'turquoise';

type ActorSource = 'api' | 'system' | 'workflow';

export type ContactActor = {
  avatarUrl?: string;
  name: string;
  source?: ActorSource;
  tone?: ContactTone;
};
