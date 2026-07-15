import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ExecutiveProfileWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-profile.workspace-entity';

export class ExecutiveEducationWorkspaceEntity extends BaseWorkspaceEntity {
  executiveProfile: EntityRelation<ExecutiveProfileWorkspaceEntity> | null;
  executiveProfileId: string | null;
  institution: string | null;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
  isVerified: boolean;
}
