import { type FlatLogicFunctionLayer } from 'src/engine/metadata-modules/logic-function-layer/types/flat-logic-function-layer.type';

export type LogicFunctionLayerCacheMaps = {
  byId: Partial<Record<string, FlatLogicFunctionLayer>>;
};
