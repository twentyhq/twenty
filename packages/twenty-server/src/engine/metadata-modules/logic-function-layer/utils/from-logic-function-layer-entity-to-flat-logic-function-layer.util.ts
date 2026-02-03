import { type LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';
import { type FlatLogicFunctionLayer } from 'src/engine/metadata-modules/logic-function-layer/types/flat-logic-function-layer.type';

export const fromLogicFunctionLayerEntityToFlatLogicFunctionLayer = (
  entity: LogicFunctionLayerEntity,
): FlatLogicFunctionLayer => ({
  id: entity.id,
  packageJson: entity.packageJson,
  packageJsonChecksum: entity.packageJsonChecksum,
  yarnLock: entity.yarnLock,
  yarnLockChecksum: entity.yarnLockChecksum,
  workspaceId: entity.workspaceId,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
  logicFunctionIds: entity.logicFunctions?.map((lf) => lf.id) ?? [],
  availablePackages: entity.availablePackages ?? {},
});
