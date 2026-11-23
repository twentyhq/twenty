import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileFormulaExpression,
  createFormulaEvaluator,
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  isDefined,
  isFormulaFieldMetadataType,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FormulaFieldDependency } from 'src/engine/metadata-modules/formula-field/types/formula-field-dependency.type';
import { type FormulaFieldEvaluationPlan } from 'src/engine/metadata-modules/formula-field/types/formula-field-evaluation-plan.type';
import { type FormulaFieldLookup } from 'src/engine/metadata-modules/formula-field/types/formula-field-lookup.type';
import { buildFormulaFieldDescriptorsFromFlatEntityMaps } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-flat-entity-maps.util';
import { getFieldMetadataIdToColumnNamesMap } from 'src/engine/twenty-orm/utils/get-field-metadata-id-to-column-names-map.util';

type BuildFormulaFieldEvaluationPlansArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
};

const buildDependencies = ({
  fieldNames,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  fieldNames: string[];
} & Pick<
  BuildFormulaFieldEvaluationPlansArgs,
  'flatObjectMetadata' | 'flatFieldMetadataMaps'
>): (FormulaFieldDependency & {
  relationTargetObjectMetadataId: string | null;
})[] => {
  const columnNamesByFieldMetadataId = getFieldMetadataIdToColumnNamesMap(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  return getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  )
    .filter(({ name }) => fieldNames.includes(name))
    .map(({ id, name, relationTargetObjectMetadataId }) => ({
      fieldMetadataId: id,
      fieldName: name,
      columnNames: columnNamesByFieldMetadataId.get(id) ?? [],
      relationTargetObjectMetadataId,
    }));
};

// The evaluator is cached with the plan, so it only keeps the descriptors its formula reads
const keepReadFieldDescriptors = ({
  fields,
  paths,
}: {
  fields: ValidationRuleFieldDescriptor[];
  paths: string[];
}): ValidationRuleFieldDescriptor[] =>
  fields
    .filter(({ name }) => paths.includes(name))
    .map((field) =>
      isDefined(field.relationTargetFields)
        ? {
            ...field,
            relationTargetFields: field.relationTargetFields.filter(
              (targetField) =>
                paths.includes(`${field.name}.${targetField.name}`),
            ),
          }
        : field,
    );

export const buildFormulaFieldEvaluationPlans = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: BuildFormulaFieldEvaluationPlansArgs): FormulaFieldEvaluationPlan[] => {
  const formulaFlatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  ).flatMap(({ id, name, type, settings }) => {
    const expression = getFieldMetadataFormulaExpression({ settings });

    return isDefined(expression) && isFormulaFieldMetadataType(type)
      ? [
          {
            id,
            name,
            type,
            expression,
            currencyCodeExpression:
              getFieldMetadataFormulaCurrencyCodeExpression({ settings }),
          },
        ]
      : [];
  });

  if (formulaFlatFieldMetadatas.length === 0) {
    return [];
  }

  const fields = buildFormulaFieldDescriptorsFromFlatEntityMaps({
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  const columnNamesByFieldMetadataId = getFieldMetadataIdToColumnNamesMap(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  return formulaFlatFieldMetadatas.map(
    ({ id, name, type, expression, currencyCodeExpression }) => {
      const identity = {
        fieldMetadataId: id,
        fieldMetadataType: type,
        fieldName: name,
        columnNames: columnNamesByFieldMetadataId.get(id) ?? [],
      };
      const compilations = [expression, currencyCodeExpression]
        .filter(isDefined)
        .map((formulaExpression) =>
          compileFormulaExpression({ expression: formulaExpression, fields }),
        );
      const bindings = compilations.flatMap((compilation) =>
        compilation.isValid ? [compilation.bindings] : [],
      );

      if (bindings.length !== compilations.length) {
        return {
          ...identity,
          ownFields: [],
          lookups: [],
          evaluate: () => null,
        };
      }

      const paths = [
        ...new Set(bindings.flatMap((binding) => Object.keys(binding))),
      ];
      const ownFields = buildDependencies({
        fieldNames: paths,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      return {
        ...identity,
        ownFields: ownFields.map(
          ({ fieldMetadataId, fieldName, columnNames }) => ({
            fieldMetadataId,
            fieldName,
            columnNames,
          }),
        ),
        lookups: ownFields.flatMap(
          ({
            fieldName,
            relationTargetObjectMetadataId,
          }): FormulaFieldLookup[] => {
            const targetFlatObjectMetadata = isDefined(
              relationTargetObjectMetadataId,
            )
              ? findFlatEntityByIdInFlatEntityMaps({
                  flatEntityId: relationTargetObjectMetadataId,
                  flatEntityMaps: flatObjectMetadataMaps,
                })
              : undefined;

            if (!isDefined(targetFlatObjectMetadata)) {
              return [];
            }

            return [
              {
                relationFieldName: fieldName,
                targetObjectMetadataId: targetFlatObjectMetadata.id,
                targetFields: buildDependencies({
                  fieldNames: paths
                    .filter((path) => path.startsWith(`${fieldName}.`))
                    .map((path) => path.slice(fieldName.length + 1)),
                  flatObjectMetadata: targetFlatObjectMetadata,
                  flatFieldMetadataMaps,
                }).map(({ fieldMetadataId, fieldName, columnNames }) => ({
                  fieldMetadataId,
                  fieldName,
                  columnNames,
                })),
              },
            ];
          },
        ),
        evaluate: createFormulaEvaluator({
          expression,
          currencyCodeExpression,
          fields: keepReadFieldDescriptors({ fields, paths }),
          fieldMetadataType: type,
        }),
      };
    },
  );
};
