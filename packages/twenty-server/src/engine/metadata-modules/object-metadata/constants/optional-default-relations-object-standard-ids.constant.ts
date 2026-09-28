import { type STANDARD_OBJECTS } from 'twenty-shared/metadata';

// Historical upgrade commands read DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS and
// skip any workspace missing one of those objects, so a relation object added
// after them cannot join that list. Its own upgrade command provisions it, so a
// workspace can lack it until that runs: object creation mints the pair only
// when the object exists, and the command backfills objects created before.
export const OPTIONAL_DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS = [
  'agentChatThreadTarget',
] as const satisfies (keyof typeof STANDARD_OBJECTS)[];
