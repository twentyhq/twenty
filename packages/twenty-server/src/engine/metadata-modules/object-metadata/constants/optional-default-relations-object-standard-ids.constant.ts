import { type STANDARD_OBJECTS } from 'twenty-shared/metadata';

// historical upgrade commands skip workspaces missing any DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS object
export const OPTIONAL_DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS = [
  'agentChatThreadTarget',
] as const satisfies (keyof typeof STANDARD_OBJECTS)[];
