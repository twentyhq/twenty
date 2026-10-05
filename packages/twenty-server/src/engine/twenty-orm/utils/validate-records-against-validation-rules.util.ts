import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { VALIDATION_RULE_MAX_REPORTED_VIOLATIONS } from 'src/engine/metadata-modules/validation-rule/constants/validation-rule-max-reported-violations.constant';
import { VALIDATION_RULE_RECORD_CHUNK_SIZE } from 'src/engine/metadata-modules/validation-rule/constants/validation-rule-record-chunk-size.constant';
import {
  RecordValidationRuleException,
  RecordValidationRuleExceptionCode,
} from 'src/engine/metadata-modules/validation-rule/exceptions/record-validation-rule.exception';
import { type RecordValidationRuleViolation } from 'src/engine/metadata-modules/validation-rule/types/record-validation-rule-violation.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';
import { computeRecordValidationRuleViolations } from 'src/engine/metadata-modules/validation-rule/utils/compute-record-validation-rule-violations.util';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

type ValidateRecordsAgainstValidationRulesArgs<TEntity extends ObjectLiteral> =
  {
    repository: WorkspaceRepository<TEntity>;
    tableShape: WorkspaceTableShape;
    validationRules: FlatValidationRule[];
    writtenRecords: ObjectRecord[];
    inputRecordIds?: (string | undefined)[];
  };

const findLiveRelatedRecords = async <TEntity extends ObjectLiteral>({
  repository,
  targetObjectMetadataId,
  ids,
  fieldNames,
}: {
  repository: WorkspaceRepository<TEntity>;
  targetObjectMetadataId: string;
  ids: string[];
  fieldNames: string[];
}): Promise<ObjectRecord[]> => {
  if (ids.length === 0) {
    return [];
  }

  const relatedRepository = repository.getRepositoryForObjectMetadataId(
    targetObjectMetadataId,
  );

  const rawRelatedRecords =
    await relatedRepository.findRecordSnapshotsBypassingPermissions({
      ids,
      fieldNames,
    });

  return relatedRepository.formatResult<ObjectRecord[]>(
    rawRelatedRecords.filter(
      (rawRelatedRecord) => !isDefined(rawRelatedRecord.deletedAt),
    ),
  );
};

const attachRelatedRecords = async <TEntity extends ObjectLiteral>({
  repository,
  tableShape,
  validationRules,
  rawWrittenRecords,
}: {
  repository: WorkspaceRepository<TEntity>;
  tableShape: WorkspaceTableShape;
  validationRules: FlatValidationRule[];
  rawWrittenRecords: ObjectRecord[];
}): Promise<ObjectRecord[]> => {
  const bindingPaths = [
    ...new Set(
      validationRules.flatMap((validationRule) =>
        Object.keys(validationRule.bindings),
      ),
    ),
  ];

  const referencedRelationShapes = bindingPaths
    .map((bindingPath) => tableShape.relationShapeByFieldName[bindingPath])
    .filter(isDefined)
    .filter(
      (relationShape) =>
        relationShape.relationType === RelationType.MANY_TO_ONE &&
        isNonEmptyString(relationShape.joinColumnName),
    );

  let records = repository.formatResult<ObjectRecord[]>(rawWrittenRecords);

  for (const relationShape of referencedRelationShapes) {
    const joinColumnName = relationShape.joinColumnName ?? '';

    const relatedRecords = await findLiveRelatedRecords({
      repository,
      targetObjectMetadataId: relationShape.targetObjectMetadataId,
      ids: [
        ...new Set(
          rawWrittenRecords
            .map((rawWrittenRecord) => rawWrittenRecord[joinColumnName])
            .filter(isNonEmptyString),
        ),
      ],
      fieldNames: bindingPaths
        .filter((bindingPath) =>
          bindingPath.startsWith(`${relationShape.fieldName}.`),
        )
        .map((bindingPath) =>
          bindingPath.slice(relationShape.fieldName.length + 1),
        ),
    });

    const relatedRecordById = new Map(
      relatedRecords.map((relatedRecord) => [
        String(relatedRecord.id),
        relatedRecord,
      ]),
    );

    records = records.map((record, recordIndex) => ({
      ...record,
      [relationShape.fieldName]:
        relatedRecordById.get(
          String(rawWrittenRecords[recordIndex]?.[joinColumnName]),
        ) ?? null,
    }));
  }

  return records;
};

const buildInputIndexByRecordId = ({
  inputRecordIds,
  recordIds,
}: {
  inputRecordIds?: (string | undefined)[];
  recordIds: string[];
}): Map<string, number> => {
  if (!isDefined(inputRecordIds)) {
    return new Map();
  }

  const indexedRecordIds = inputRecordIds.every(isNonEmptyString)
    ? inputRecordIds
    : recordIds;

  return new Map(
    indexedRecordIds.map((recordId, inputIndex) => [recordId, inputIndex]),
  );
};

export const validateRecordsAgainstValidationRulesOrThrow = async <
  TEntity extends ObjectLiteral,
>({
  repository,
  tableShape,
  validationRules,
  writtenRecords,
  inputRecordIds,
}: ValidateRecordsAgainstValidationRulesArgs<TEntity>): Promise<void> => {
  const recordIds = writtenRecords
    .map((writtenRecord) => writtenRecord.id)
    .filter(isNonEmptyString);

  if (recordIds.length === 0) {
    return;
  }

  const inputIndexByRecordId = buildInputIndexByRecordId({
    inputRecordIds,
    recordIds,
  });

  const fields = buildValidationRuleFieldDescriptors({
    objectMetadataId: tableShape.objectMetadataId,
    flatObjectMetadataMaps: repository.internalContext.flatObjectMetadataMaps,
    flatFieldMetadataMaps: repository.internalContext.flatFieldMetadataMaps,
  });
  const fieldNames = [
    ...new Set(
      validationRules.flatMap((validationRule) =>
        Object.keys(validationRule.bindings).filter(
          (bindingPath) => !bindingPath.includes('.'),
        ),
      ),
    ),
  ];
  const now = new Date().toISOString();
  const validationRulesWithActiveErrorField = validationRules.map(
    (validationRule) =>
      isDefined(validationRule.errorFieldMetadataId) &&
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: validationRule.errorFieldMetadataId,
        flatEntityMaps: repository.internalContext.flatFieldMetadataMaps,
      })?.isActive !== true
        ? { ...validationRule, errorFieldMetadataId: null }
        : validationRule,
  );

  const violations: RecordValidationRuleViolation[] = [];
  const evaluationErrors: RecordValidationRuleViolation[] = [];

  for (
    let chunkStart = 0;
    chunkStart < recordIds.length &&
    violations.length + evaluationErrors.length <
      VALIDATION_RULE_MAX_REPORTED_VIOLATIONS;
    chunkStart += VALIDATION_RULE_RECORD_CHUNK_SIZE
  ) {
    const rawWrittenRecords =
      await repository.findRecordSnapshotsBypassingPermissions({
        fieldNames,
        ids: recordIds.slice(
          chunkStart,
          chunkStart + VALIDATION_RULE_RECORD_CHUNK_SIZE,
        ),
      });

    const chunkResult = computeRecordValidationRuleViolations({
      records: await attachRelatedRecords({
        repository,
        tableShape,
        validationRules,
        rawWrittenRecords,
      }),
      validationRules: validationRulesWithActiveErrorField,
      fields,
      now,
      inputIndexByRecordId,
      maxViolations:
        VALIDATION_RULE_MAX_REPORTED_VIOLATIONS -
        violations.length -
        evaluationErrors.length,
    });

    violations.push(...chunkResult.violations);
    evaluationErrors.push(...chunkResult.evaluationErrors);
  }

  if (evaluationErrors.length > 0) {
    throw new RecordValidationRuleException(
      'A validation rule could not be evaluated',
      RecordValidationRuleExceptionCode.VALIDATION_RULE_EVALUATION_FAILED,
      evaluationErrors,
    );
  }

  if (violations.length > 0) {
    throw new RecordValidationRuleException(
      violations[0].message,
      RecordValidationRuleExceptionCode.VALIDATION_RULE_VIOLATION,
      violations,
    );
  }
};
