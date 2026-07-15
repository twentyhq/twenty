import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ExecutiveProfileWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-profile.workspace-entity';
import { type CapabilityCategory } from 'src/modules/executive-search/common/enums/capability-category.enum';
import { type CapabilityProficiencyLevel } from 'src/modules/executive-search/common/enums/capability-proficiency-level.enum';
import { type CapabilitySource } from 'src/modules/executive-search/common/enums/capability-source.enum';

export class ExecutiveCapabilityWorkspaceEntity extends BaseWorkspaceEntity {
  executiveProfile: EntityRelation<ExecutiveProfileWorkspaceEntity> | null;
  executiveProfileId: string | null;
  name: string | null;
  category: CapabilityCategory;
  proficiencyLevel: CapabilityProficiencyLevel;
  source: CapabilitySource;
}
