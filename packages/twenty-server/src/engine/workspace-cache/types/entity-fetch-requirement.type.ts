import { type EntityTarget, type ObjectLiteral } from 'typeorm';

export type WorkspaceScopedRow = ObjectLiteral & { workspaceId: string };

export type EntityFetchRequirement = {
  entityTarget: EntityTarget<WorkspaceScopedRow>;
  // undefined = full rows
  columns?: readonly string[];
};
