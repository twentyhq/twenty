import { type ObjectLiteral } from 'typeorm';

// Entities accessed through WorkspaceScopedRepository must declare a
// workspaceId column. The constraint is enforced both at compile time
// (the generic bound) and at runtime (every read/write merges
// workspaceId into the criteria).
export type WorkspaceScopedEntity = ObjectLiteral & { workspaceId: string };
