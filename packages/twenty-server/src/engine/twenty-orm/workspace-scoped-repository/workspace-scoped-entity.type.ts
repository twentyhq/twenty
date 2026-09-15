import { type ObjectLiteral } from 'typeorm';

export type WorkspaceScopedEntity = ObjectLiteral & {
  workspaceId: string | null;
};
