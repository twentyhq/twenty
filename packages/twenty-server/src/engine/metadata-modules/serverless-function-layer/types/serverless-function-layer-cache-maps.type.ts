import { type FlatServerlessFunctionLayer } from 'src/engine/metadata-modules/serverless-function-layer/types/flat-serverless-function-layer.type';

export type ServerlessFunctionLayerCacheMaps = {
  byId: Partial<Record<string, FlatServerlessFunctionLayer>>;
};
