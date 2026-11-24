import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration/utils/compute-postgres-enum-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import {
  type FieldMetadataOptionEnumChange,
  type FieldMetadataOptionEnumChangeOfMigration,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/field-metadata-option-enum-change.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

@Injectable()
export class FieldMetadataOptionEnumSchemaService {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  // Fields without their own action have their enum rebuilt before any action, so later ones see the final column.
  async applyEnumChangesOfFieldsWithoutFieldAction({
    fieldMetadataOptionEnumChanges,
    allFlatEntityMaps: { flatFieldMetadataMaps, flatObjectMetadataMaps },
    queryRunner,
    workspaceId,
  }: {
    fieldMetadataOptionEnumChanges: ReadonlyMap<
      string,
      FieldMetadataOptionEnumChangeOfMigration
    >;
    allFlatEntityMaps: Pick<
      AllFlatEntityMaps,
      'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
    >;
    queryRunner: QueryRunner;
    workspaceId: string;
  }): Promise<void> {
    for (const [
      universalIdentifier,
      enumChange,
    ] of fieldMetadataOptionEnumChanges) {
      const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });
      const flatObjectMetadata = isDefined(flatFieldMetadata)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: flatFieldMetadata.objectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined;

      if (
        enumChange.hasFieldAction ||
        !isDefined(flatFieldMetadata) ||
        !isDefined(flatObjectMetadata)
      ) {
        continue;
      }

      await this.applyEnumChange({
        enumChange,
        flatFieldMetadata,
        flatObjectMetadata,
        queryRunner,
        workspaceId,
      });
    }
  }

  // Returns false when the enum already holds the target values in option order, so the column is left alone.
  async applyEnumChange({
    enumChange: { fromOptionRows, toOptionRows },
    flatFieldMetadata,
    flatObjectMetadata,
    queryRunner,
    workspaceId,
  }: {
    enumChange: FieldMetadataOptionEnumChange;
    flatFieldMetadata: FlatFieldMetadata;
    flatObjectMetadata: FlatObjectMetadata;
    queryRunner: QueryRunner;
    workspaceId: string;
  }): Promise<boolean> {
    if (toOptionRows.length === 0) {
      return false;
    }

    // Enum order drives SQL comparisons and sorts, so it follows option positions like realtime matching does.
    const orderedToOptionRows = [...toOptionRows].sort(
      (first, second) =>
        first.position - second.position ||
        first.universalIdentifier.localeCompare(second.universalIdentifier),
    );
    const toValueByUniversalIdentifier = new Map(
      orderedToOptionRows.map(({ universalIdentifier, value }) => [
        universalIdentifier,
        value,
      ]),
    );
    const toValues = [...new Set(toValueByUniversalIdentifier.values())];
    const oldToNewEnumOptionMap: Record<string, string> = {};

    for (const { universalIdentifier, value } of fromOptionRows) {
      // A row replaced by another one holding the same value keeps its records.
      const toValue =
        toValueByUniversalIdentifier.get(universalIdentifier) ??
        (toValues.includes(value) ? value : undefined);

      if (isDefined(toValue)) {
        oldToNewEnumOptionMap[value] = toValue;
      }
    }

    const isValueMoved = Object.entries(oldToNewEnumOptionMap).some(
      ([fromValue, toValue]) => fromValue !== toValue,
    );
    const fromValues = new Set(fromOptionRows.map(({ value }) => value));
    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });
    let wasEnumChanged = false;

    for (const columnDefinition of generateColumnDefinitions({
      flatFieldMetadata,
      flatObjectMetadata,
      workspaceId,
    })) {
      const currentEnumValues = await this.findEnumValues({
        queryRunner,
        schemaName,
        tableName,
        columnName: columnDefinition.name,
      });
      // Values no option row declares are not ours to drop, so records holding them keep them.
      const enumValuesWithoutOptionRow = currentEnumValues.filter(
        (value) => !fromValues.has(value) && !toValues.includes(value),
      );
      const enumValues = [...toValues, ...enumValuesWithoutOptionRow];

      if (
        !isValueMoved &&
        enumValues.length === currentEnumValues.length &&
        enumValues.every((value, index) => value === currentEnumValues[index])
      ) {
        continue;
      }

      await this.workspaceSchemaManagerService.enumManager.alterEnumValues({
        queryRunner,
        schemaName,
        tableName,
        columnDefinition,
        enumValues,
        oldToNewEnumOptionMap: {
          ...oldToNewEnumOptionMap,
          ...Object.fromEntries(
            enumValuesWithoutOptionRow.map((value) => [value, value]),
          ),
        },
      });
      wasEnumChanged = true;
    }

    return wasEnumChanged;
  }

  private async findEnumValues({
    queryRunner,
    schemaName,
    tableName,
    columnName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnName: string;
  }): Promise<string[]> {
    const enumValueRows: { value: string }[] = await queryRunner.query(
      `SELECT unnest(enum_range(NULL::${escapeIdentifier(schemaName)}.${escapeIdentifier(
        computePostgresEnumName({ tableName, columnName }),
      )}))::text AS value`,
    );

    return enumValueRows.map(({ value }) => value);
  }
}
