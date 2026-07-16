import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ExecutiveProfileWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-profile.workspace-entity';

export class ExecutiveAwardWorkspaceEntity extends BaseWorkspaceEntity {
  executiveProfile: EntityRelation<ExecutiveProfileWorkspaceEntity> | null;
  executiveProfileId: string | null;
  title: string | null;
  issuer: string | null;
  dateReceived: string | null;
  description: string | null;
}
