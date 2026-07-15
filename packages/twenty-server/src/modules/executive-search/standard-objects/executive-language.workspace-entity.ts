import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ExecutiveProfileWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-profile.workspace-entity';
import { type LanguageProficiency } from 'src/modules/executive-search/common/enums/language-proficiency.enum';

export class ExecutiveLanguageWorkspaceEntity extends BaseWorkspaceEntity {
  executiveProfile: EntityRelation<ExecutiveProfileWorkspaceEntity> | null;
  executiveProfileId: string | null;
  language: string | null;
  proficiency: LanguageProficiency;
}
