import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import {
  type FieldMetadataOptionEnumChange,
  type FieldMetadataOptionEnumChangeTracker,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/field-metadata-option-enum-change.type';
import { fromFieldMetadataOptionsToOptionRows } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/build-field-metadata-option-enum-change-from-options.util';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

@Injectable()
export class FieldMetadataOptionEnumSchemaService {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  async applyEnumChangeOfOptionAction({
    fieldMetadataUniversalIdentifier,
    fieldMetadataOptionEnumChangeTracker,
    allFlatEntityMaps: { flatFieldMetadataMaps, flatObjectMetadataMaps },
    queryRunner,
    workspaceId,
  }: {
    fieldMetadataUniversalIdentifier: string | undefined;
    fieldMetadataOptionEnumChangeTracker:
      | FieldMetadataOptionEnumChangeTracker
      | undefined;
    allFlatEntityMaps: Pick<
      AllFlatEntityMaps,
      'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
    >;
    queryRunner: QueryRunner;
    workspaceId: string;
  }): Promise<void> {
    if (
      !isDefined(fieldMetadataUniversalIdentifier) ||
      !isDefined(fieldMetadataOptionEnumChangeTracker) ||
      fieldMetadataOptionEnumChangeTracker.hasFieldAction(
        fieldMetadataUniversalIdentifier,
      )
    ) {
      return;
    }

    const enumChange = fieldMetadataOptionEnumChangeTracker.consume(
      fieldMetadataUniversalIdentifier,
    );
    const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: fieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    const flatObjectMetadata = isDefined(flatFieldMetadata)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatFieldMetadata.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;

    if (
      !isDefined(enumChange) ||
      !isDefined(flatFieldMetadata) ||
      !isDefined(flatObjectMetadata)
    ) {
      return;
    }

    await this.applyEnumChange({
      enumChange,
      flatFieldMetadata,
      flatObjectMetadata,
      queryRunner,
      workspaceId,
    });
  }

  // Returns false when the enum already holds the target values, so the column is left alone.
  async applyEnumChange({
    enumChange: { fromOptionRows: fromOptionRowsOfChange, toOptionRows },
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
    // A field whose missing rows are being created already holds the values of its options
    const fromUniversalIdentifiers = new Set(
      fromOptionRowsOfChange.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    );
    const fromOptionRows = [
      ...fromOptionRowsOfChange,
      ...fromFieldMetadataOptionsToOptionRows(flatFieldMetadata.options).filter(
        ({ universalIdentifier }) =>
          !fromUniversalIdentifiers.has(universalIdentifier),
      ),
    ];

    const toValueByUniversalIdentifier = new Map(
      toOptionRows.map(({ universalIdentifier, value }) => [
        universalIdentifier,
        value,
      ]),
    );
    const toValues = new Set(toValueByUniversalIdentifier.values());
    const oldToNewEnumOptionMap: Record<string, string> = {};

    for (const { universalIdentifier, value } of fromOptionRows) {
      // A row replaced by another one holding the same value keeps its records.
      const toValue =
        toValueByUniversalIdentifier.get(universalIdentifier) ??
        (toValues.has(value) ? value : undefined);

      if (toValue !== undefined) {
        oldToNewEnumOptionMap[value] = toValue;
      }
    }

    const hasSameValues =
      fromOptionRows.length === toOptionRows.length &&
      fromOptionRows.every(
        ({ value }) => oldToNewEnumOptionMap[value] === value,
      );

    if (hasSameValues || toOptionRows.length === 0) {
      return false;
    }

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });

    for (const columnDefinition of generateColumnDefinitions({
      flatFieldMetadata,
      flatObjectMetadata,
      workspaceId,
    })) {
      await this.workspaceSchemaManagerService.enumManager.alterEnumValues({
        queryRunner,
        schemaName,
        tableName,
        columnDefinition,
        enumValues: [...toValues],
        oldToNewEnumOptionMap,
      });
    }

    return true;
  }
}
