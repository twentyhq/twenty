import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FormulaFieldEvaluationPlan } from 'src/engine/metadata-modules/formula-field/types/formula-field-evaluation-plan.type';
import { buildFormulaFieldEvaluationPlans } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-evaluation-plans.util';

// Flat snapshots are immutable per metadata version, so plans are memoized by identity
const formulaFieldEvaluationPlansCache = new WeakMap<
  FlatEntityMaps<OrmFlatFieldMetadata>,
  WeakMap<FlatObjectMetadata, FormulaFieldEvaluationPlan[]>
>();

export const getFormulaFieldEvaluationPlans = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): FormulaFieldEvaluationPlan[] => {
  const existingPlansByObjectMetadata = formulaFieldEvaluationPlansCache.get(
    flatFieldMetadataMaps,
  );
  const cachedPlansByObjectMetadata =
    existingPlansByObjectMetadata ??
    new WeakMap<FlatObjectMetadata, FormulaFieldEvaluationPlan[]>();

  if (!isDefined(existingPlansByObjectMetadata)) {
    formulaFieldEvaluationPlansCache.set(
      flatFieldMetadataMaps,
      cachedPlansByObjectMetadata,
    );
  }

  const cachedPlans = cachedPlansByObjectMetadata.get(flatObjectMetadata);

  if (isDefined(cachedPlans)) {
    return cachedPlans;
  }

  const plans = buildFormulaFieldEvaluationPlans({
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  cachedPlansByObjectMetadata.set(flatObjectMetadata, plans);

  return plans;
};
