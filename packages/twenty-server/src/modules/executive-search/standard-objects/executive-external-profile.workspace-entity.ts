import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ExecutiveProfileWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-profile.workspace-entity';
import { type ExternalProfilePlatform } from 'src/modules/executive-search/common/enums/external-profile-platform.enum';

export class ExecutiveExternalProfileWorkspaceEntity extends BaseWorkspaceEntity {
  executiveProfile: EntityRelation<ExecutiveProfileWorkspaceEntity> | null;
  executiveProfileId: string | null;
  platform: ExternalProfilePlatform;
  url: string | null;
  handle: string | null;
}
