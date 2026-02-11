import { toScalarFlatEntity } from 'src/engine/metadata-modules/flat-entity/transpiler/to-scalar-flat-entity.util';
import { toUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/transpiler/to-universal-flat-entity.util';

export const flatEntityTranspilers = {
  toUniversalFlatEntity,
  toScalarFlatEntity,
} as const;
