export const DATABASE_EVENT_ACTOR_TYPES = [
  'user',
  'apiKey',
  'application',
  'system',
] as const;

export type DatabaseEventActorType =
  (typeof DATABASE_EVENT_ACTOR_TYPES)[number];

export type DatabaseEventActor = {
  type: DatabaseEventActorType;
};

export const isDatabaseEventActorType = (
  value: unknown,
): value is DatabaseEventActorType =>
  typeof value === 'string' &&
  (DATABASE_EVENT_ACTOR_TYPES as readonly string[]).includes(value);
