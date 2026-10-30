import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isArray, isString } from '@sniptt/guards';
import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { INTEGRITY_RULES } from 'src/modules/integrity-rules/constants/integrity-rules.constant';
import { type IntegrityRule } from 'src/modules/integrity-rules/types/integrity-rule.type';
import { type IntegrityRuleField } from 'src/modules/integrity-rules/types/integrity-rule-field.type';
import { type IntegrityViolation } from 'src/modules/integrity-rules/types/integrity-violation.type';
import { findNewIntegrityViolations } from 'src/modules/integrity-rules/utils/find-new-integrity-violations.util';
import { getIntegrityRuleFieldNames } from 'src/modules/integrity-rules/utils/get-integrity-rule-field-names.util';
import { mergeRecordUpdate } from 'src/modules/integrity-rules/utils/merge-record-update.util';

type IntegrityRuleObjectContext = {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  fieldsByName: Record<string, IntegrityRuleField>;
};

@Injectable()
export class IntegrityRuleEnforcerService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async assertCreateIsValid({
    authContext,
    objectName,
    records,
    upsert,
  }: {
    authContext: WorkspaceAuthContext;
    objectName: string;
    records: Partial<ObjectRecord>[];
    upsert?: boolean;
  }): Promise<void> {
    const rules = this.getRules(objectName);

    if (rules.length === 0 || records.length === 0) {
      return;
    }

    const objectContext = await this.getObjectContext(authContext, objectName);

    if (!isDefined(objectContext)) {
      return;
    }

    const recordIds = records.map(({ id }) => id).filter(isString);

    const existingRecords =
      upsert === true && recordIds.length > 0
        ? await this.findRecords(authContext, objectName, objectContext, {
            id: { in: recordIds },
          })
        : [];

    const violations = records.flatMap((record) => {
      const previousRecord = existingRecords.find(({ id }) => id === record.id);

      return findNewIntegrityViolations({
        rules,
        fieldsByName: objectContext.fieldsByName,
        previousRecord,
        record: isDefined(previousRecord)
          ? mergeRecordUpdate(previousRecord, record)
          : record,
      });
    });

    this.throwIfViolations(violations);
  }

  async assertUpdateIsValid({
    authContext,
    objectName,
    filter,
    data,
  }: {
    authContext: WorkspaceAuthContext;
    objectName: string;
    filter: Partial<ObjectRecordFilter>;
    data: Partial<ObjectRecord>;
  }): Promise<void> {
    const rules = this.getRules(objectName);

    if (rules.length === 0) {
      return;
    }

    const objectContext = await this.getObjectContext(authContext, objectName);

    if (!isDefined(objectContext)) {
      return;
    }

    const updatedKeys = Object.keys(data);

    const affectedRules = rules.filter((rule) =>
      getIntegrityRuleFieldNames(rule).some((fieldName) => {
        const field = objectContext.fieldsByName[fieldName];

        return (
          isDefined(field) &&
          (updatedKeys.includes(field.name) ||
            updatedKeys.includes(field.recordKey))
        );
      }),
    );

    if (affectedRules.length === 0) {
      return;
    }

    const previousRecords = await this.findRecords(
      authContext,
      objectName,
      objectContext,
      filter,
    );

    const violations = previousRecords.flatMap((previousRecord) =>
      findNewIntegrityViolations({
        rules: affectedRules,
        fieldsByName: objectContext.fieldsByName,
        previousRecord,
        record: mergeRecordUpdate(previousRecord, data),
      }),
    );

    this.throwIfViolations(violations);
  }

  private getRules(objectName: string): IntegrityRule[] {
    return INTEGRITY_RULES.filter((rule) => rule.objectName === objectName);
  }

  private async getObjectContext(
    authContext: WorkspaceAuthContext,
    objectName: string,
  ): Promise<IntegrityRuleObjectContext | undefined> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: authContext.workspace.id,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: idByNameSingular[objectName],
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return undefined;
    }

    const fieldsByName: Record<string, IntegrityRuleField> = {};

    for (const flatField of findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: flatObjectMetadata.fieldIds,
    })) {
      const joinColumnName = (
        flatField.settings as { joinColumnName?: string | null } | null
      )?.joinColumnName;
      const isRelation = flatField.type === FieldMetadataType.RELATION;

      // Only relations stored on this record can be checked; one-to-many
      // relations would need a count query per record.
      if (!flatField.isActive || (isRelation && !isString(joinColumnName))) {
        continue;
      }

      const options = isArray(flatField.options)
        ? (flatField.options as { value: string; label: string }[])
        : [];

      fieldsByName[flatField.name] = {
        name: flatField.name,
        label: flatField.label,
        type: flatField.type,
        recordKey:
          isRelation && isString(joinColumnName)
            ? joinColumnName
            : flatField.name,
        optionLabels: Object.fromEntries(
          options.map(({ value, label }) => [value, label]),
        ),
      };
    }

    return {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      fieldsByName,
    };
  }

  private async findRecords(
    authContext: WorkspaceAuthContext,
    objectName: string,
    objectContext: IntegrityRuleObjectContext,
    filter: Partial<ObjectRecordFilter>,
  ): Promise<ObjectRecord[]> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = this.workspaceOrmManager.getRepository(objectName, {
        shouldBypassPermissionChecks: true,
      });

      const queryParser = new GraphqlQueryParser(
        objectContext.flatObjectMetadata,
        objectContext.flatObjectMetadataMaps,
        objectContext.flatFieldMetadataMaps,
      );

      const queryBuilder = repository.createQueryBuilder(objectName);

      queryParser.applyFilterToBuilder(queryBuilder, objectName, filter);

      return queryBuilder.getMany();
    }, authContext);
  }

  private throwIfViolations(violations: IntegrityViolation[]): void {
    if (violations.length === 0) {
      return;
    }

    const details = [...new Set(violations.map(({ message }) => message))].join(
      '. ',
    );

    throw new CommonQueryRunnerException(
      `Integrity rules violated: ${violations
        .map(({ ruleKey }) => ruleKey)
        .join(', ')}`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`${details}.` },
    );
  }
}
