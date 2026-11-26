import { v4 } from 'uuid';
import { ToolCategory } from 'twenty-shared/ai';
import { FORMULA_FIELD_METADATA_TYPES } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaEvaluation,
  isDefined,
} from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { FIELD_METADATA_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/field-metadata/constants/field-metadata-write-access-policy.constant';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import {
  FORMULA_CURRENCY_CODE_EXPRESSION_DESCRIPTION,
  FORMULA_EXPRESSION_DESCRIPTION,
} from 'src/engine/metadata-modules/field-metadata/tools/constants/formula-description.constant';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { validateFlatFieldMetadataFormula } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-formula.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { setFormulaFieldBindings } from 'src/engine/metadata-modules/formula-field/utils/set-formula-field-bindings.util';
import { MetadataToolIdentifierService } from 'src/engine/metadata-modules/object-metadata/tools/services/metadata-tool-identifier.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const validateFormulaExpressionInputSchema = z.object({
  objectName: z
    .string()
    .describe(
      'Object the formula field belongs to, singular or plural (e.g. "company").',
    ),
  type: z
    .enum(FORMULA_FIELD_METADATA_TYPES)
    .describe('Type of the formula field, which its value must match.'),
  expression: z.string().describe(FORMULA_EXPRESSION_DESCRIPTION),
  currencyCodeExpression: z
    .string()
    .optional()
    .describe(FORMULA_CURRENCY_CODE_EXPRESSION_DESCRIPTION),
  fieldName: z
    .string()
    .optional()
    .describe(
      'Name of the field when it already exists and its formula is being changed. Leave out for a new field.',
    ),
});

@DefineTool({
  name: 'validate_formula_expression',
  isReadOnly: true,
  category: ToolCategory.METADATA,
  accessPolicy: {
    ...FIELD_METADATA_WRITE_ACCESS_POLICY,
    requiredFeatureFlags: [FeatureFlagKey.IS_FORMULA_FIELD_ENABLED],
  },
  icon: 'IconSettings',
  description:
    'Check a formula field expression against an object without saving anything, with the same checks as create_field_metadata. An invalid expression is rejected with the reason. A valid one returns its evaluation: QUERY_TIME is computed on every read, STORED (any formula that aggregates related records) is computed in the background and reads null until its backfill reaches each record.',
})
export class ValidateFormulaExpressionTool extends BaseTool<
  typeof validateFormulaExpressionInputSchema
> {
  readonly inputSchema = validateFormulaExpressionInputSchema;

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly metadataToolIdentifierService: MetadataToolIdentifierService,
  ) {
    super();
  }

  async execute({
    input: { objectName, type, expression, currencyCodeExpression, fieldName },
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof validateFormulaExpressionInputSchema
  >): Promise<ToolOutput> {
    const objectMetadataId =
      await this.metadataToolIdentifierService.getObjectMetadataIdOrThrow({
        workspaceId,
        objectName,
      });

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'featureFlagsMap',
      ]);

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    const existingFlatFieldMetadata = isDefined(fieldName)
      ? getFlatFieldsFromFlatObjectMetadata(
          flatObjectMetadata,
          flatFieldMetadataMaps,
        ).find((flatFieldMetadata) => flatFieldMetadata.name === fieldName)
      : undefined;

    if (isDefined(fieldName) && !isDefined(existingFlatFieldMetadata)) {
      throw new FieldMetadataException(
        `Field "${fieldName}" not found on ${objectName}. Leave fieldName out for a new field.`,
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    const candidateFlatFieldMetadata = setFormulaFieldBindings({
      universalFlatFieldMetadata: {
        name: existingFlatFieldMetadata?.name ?? 'formulaExpressionPreview',
        type,
        universalIdentifier:
          existingFlatFieldMetadata?.universalIdentifier ?? v4(),
        universalSettings: null,
        formula: {
          expression,
          ...(isDefined(currencyCodeExpression)
            ? { currencyCodeExpression }
            : {}),
        },
        objectMetadataUniversalIdentifier:
          flatObjectMetadata.universalIdentifier,
        relationTargetObjectMetadataUniversalIdentifier: null,
      },
      universalFlatObjectMetadataMaps: flatObjectMetadataMaps,
      universalFlatFieldMetadataMaps: flatFieldMetadataMaps,
    });

    const errors = validateFlatFieldMetadataFormula({
      flatFieldMetadataToValidate: {
        ...candidateFlatFieldMetadata,
        isUnique: false,
        isSearchable: false,
      },
      existingFormula: existingFlatFieldMetadata?.formula,
      universalFlatObjectMetadataMaps: flatObjectMetadataMaps,
      universalFlatFieldMetadataMaps: flatFieldMetadataMaps,
      isFormulaFieldEnabled:
        featureFlagsMap[FeatureFlagKey.IS_FORMULA_FIELD_ENABLED] ?? false,
    });

    if (errors.length > 0) {
      throw new FieldMetadataException(
        errors.map((error) => error.message).join('. '),
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    const evaluation = getFieldMetadataFormulaEvaluation(
      candidateFlatFieldMetadata,
    );

    return {
      success: true,
      message:
        evaluation === 'STORED'
          ? 'The formula is valid. It is stored: computed in the background, it reads null until its backfill reaches each record.'
          : 'The formula is valid. It is computed on every read.',
      result: { evaluation },
    };
  }
}
