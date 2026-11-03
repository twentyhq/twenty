import { type CommandMenuContextApi } from '../../CommandMenuContextApi';

export type ConditionalDisplayEngineContextKey = Exclude<
  keyof CommandMenuContextApi,
  'favoriteRecordIds'
>;
