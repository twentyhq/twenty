import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';

export const fromFrontComponentEntityToFlatFrontComponent = (
  frontComponentEntity: FrontComponentEntity,
): FlatFrontComponent => {
  return {
    id: frontComponentEntity.id,
    name: frontComponentEntity.name,
    workspaceId: frontComponentEntity.workspaceId,
    universalIdentifier: frontComponentEntity.universalIdentifier,
    applicationId: frontComponentEntity.applicationId,
    createdAt: frontComponentEntity.createdAt.toISOString(),
    updatedAt: frontComponentEntity.updatedAt.toISOString(),
  };
};
