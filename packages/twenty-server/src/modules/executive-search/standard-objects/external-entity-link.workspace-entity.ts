import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { ExternalSystem } from 'src/modules/executive-search/standard-objects/enums/external-system.enum';

export class ExternalEntityLinkWorkspaceEntity extends BaseWorkspaceEntity {
  externalSystem: ExternalSystem;
  externalCollection: string;
  externalRecordId: string;
  targetObjectMetadataId: string;
  targetRecordId: string;
  isActive: boolean;
  deactivatedAt: string | null;
}
