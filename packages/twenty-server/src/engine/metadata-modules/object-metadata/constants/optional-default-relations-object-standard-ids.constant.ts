import { type STANDARD_OBJECTS } from 'twenty-shared/metadata';

// historical upgrade commands skip workspaces missing any DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS object, so later
// relation objects go here: a workspace lacks them until their own upgrade command provisions them
export const OPTIONAL_DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS = [
  'agentChatThreadTarget',
] as const satisfies (keyof typeof STANDARD_OBJECTS)[];
