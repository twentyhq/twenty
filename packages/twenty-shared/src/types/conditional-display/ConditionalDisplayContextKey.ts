import { type ConditionalDisplayAdminContextKey } from './ConditionalDisplayAdminContextKey';
import { type ConditionalDisplayEngineContextKey } from './internal/ConditionalDisplayEngineContextKey';

export type ConditionalDisplayContextKey =
  | ConditionalDisplayAdminContextKey
  | ConditionalDisplayEngineContextKey;
