import { type RichTextMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ExecutiveProfileWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-profile.workspace-entity';
import { type EmploymentType } from 'src/modules/executive-search/common/enums/employment-type.enum';

export class ExecutiveCareerExperienceWorkspaceEntity extends BaseWorkspaceEntity {
  executiveProfile: EntityRelation<ExecutiveProfileWorkspaceEntity> | null;
  executiveProfileId: string | null;
  company: string | null;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  employmentType: EmploymentType;
  industry: string | null;
  description: RichTextMetadata | null;
}
