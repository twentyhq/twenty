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

type GetFormulaFieldEvaluationPlansArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
};

export const getFormulaFieldEvaluationPlans = (
  args: GetFormulaFieldEvaluationPlansArgs,
): FormulaFieldEvaluationPlan[] => {
  const { flatObjectMetadata, flatFieldMetadataMaps } = args;
  const plansByObjectMetadata =
    formulaFieldEvaluationPlansCache.get(flatFieldMetadataMaps) ??
    new WeakMap<FlatObjectMetadata, FormulaFieldEvaluationPlan[]>();
  const plans =
    plansByObjectMetadata.get(flatObjectMetadata) ??
    buildFormulaFieldEvaluationPlans(args);

  formulaFieldEvaluationPlansCache.set(
    flatFieldMetadataMaps,
    plansByObjectMetadata,
  );
  plansByObjectMetadata.set(flatObjectMetadata, plans);

  return plans;
};
