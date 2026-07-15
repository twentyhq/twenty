import { type FileOutput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ExecutiveProfileWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-profile.workspace-entity';
import { type ArtifactType } from 'src/modules/executive-search/common/enums/artifact-type.enum';
import { type ArtifactVisibility } from 'src/modules/executive-search/common/enums/artifact-visibility.enum';

export class ExecutiveArtifactWorkspaceEntity extends BaseWorkspaceEntity {
  executiveProfile: EntityRelation<ExecutiveProfileWorkspaceEntity> | null;
  executiveProfileId: string | null;
  type: ArtifactType;
  title: string | null;
  description: string | null;
  file: FileOutput[] | null;
  externalUrl: string | null;
  sourceHash: string | null;
  version: number | null;
  visibility: ArtifactVisibility;
  sourceUpdatedAt: string | null;
}
