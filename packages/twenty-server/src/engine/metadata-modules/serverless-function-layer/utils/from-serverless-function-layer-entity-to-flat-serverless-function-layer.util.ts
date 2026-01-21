import { type ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { type FlatServerlessFunctionLayer } from 'src/engine/metadata-modules/serverless-function-layer/types/flat-serverless-function-layer.type';

export const fromServerlessFunctionLayerEntityToFlatServerlessFunctionLayer = (
  entity: ServerlessFunctionLayerEntity,
): FlatServerlessFunctionLayer => ({
  id: entity.id,
  packageJson: entity.packageJson,
  yarnLock: entity.yarnLock,
  checksum: entity.checksum,
  workspaceId: entity.workspaceId,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
  serverlessFunctionIds: entity.serverlessFunctions?.map((sf) => sf.id) ?? [],
});
