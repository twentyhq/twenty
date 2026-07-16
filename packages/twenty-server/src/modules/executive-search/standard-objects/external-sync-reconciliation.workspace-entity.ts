import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class ExternalSyncReconciliationWorkspaceEntity extends BaseWorkspaceEntity {
  workspaceId: string;
  externalSystemName: string;
  entityName: string;
  startedAt: string;
  completedAt: string | null;
  status: string;
  totalCompared: number;
  matched: number;
  onlyInTwenty: number;
  onlyInExternal: number;
  differenceCount: number;
  findings: Record<string, unknown> | null;
  searchVector: string;
}
