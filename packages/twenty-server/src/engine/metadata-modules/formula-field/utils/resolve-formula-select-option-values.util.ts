import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  type FlatFieldMetadataOptionMapsForOptions,
  resolveFlatFieldMetadataOptions,
} from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FormulaFieldEvaluationPlan } from 'src/engine/metadata-modules/formula-field/types/formula-field-evaluation-plan.type';

export const resolveFormulaSelectOptionValues = ({
  formulaFieldEvaluationPlans,
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
}: {
  formulaFieldEvaluationPlans: Pick<
    FormulaFieldEvaluationPlan,
    'fieldMetadataId' | 'fieldMetadataType'
  >[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
}): Map<string, string[]> =>
  new Map(
    formulaFieldEvaluationPlans
      .filter(
        ({ fieldMetadataType }) =>
          fieldMetadataType === FieldMetadataType.SELECT,
      )
      .map(({ fieldMetadataId }): [string, string[]] => {
        const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });
        const options = isDefined(flatFieldMetadata)
          ? resolveFlatFieldMetadataOptions({
              flatFieldMetadata,
              flatFieldMetadataOptionMaps,
            })
          : null;

        return [fieldMetadataId, (options ?? []).map(({ value }) => value)];
      }),
  );
