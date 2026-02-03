import { type LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';
import { type FlatLogicFunctionLayer } from 'src/engine/metadata-modules/logic-function-layer/types/flat-logic-function-layer.type';

export const fromLogicFunctionLayerEntityToFlatLogicFunctionLayer = (
  entity: LogicFunctionLayerEntity,
): FlatLogicFunctionLayer => ({
  id: entity.id,
  packageJson: entity.packageJson,
  yarnLock: entity.yarnLock,
  checksum: entity.checksum,
  workspaceId: entity.workspaceId,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
  logicFunctionIds: entity.logicFunctions?.map((lf) => lf.id) ?? [],
});
