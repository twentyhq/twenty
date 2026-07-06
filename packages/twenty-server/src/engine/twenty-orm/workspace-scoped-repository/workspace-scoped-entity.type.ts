import { type ObjectLiteral } from 'typeorm';

// workspaceId is nullable on entities that also hold instance-scoped rows
// (e.g. FileEntity); the wrapper always filters with a concrete workspaceId,
// so null rows are invisible through it.
export type WorkspaceScopedEntity = ObjectLiteral & {
  workspaceId: string | null;
};
