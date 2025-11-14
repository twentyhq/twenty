import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Command({
  name: 'workspace:fix-composite-field-columns',
  description:
    'Add missing columns for composite fields (IMAGE, PDF, etc.) that were created before all properties were defined',
})
export class FixCompositeFieldColumnsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    index,
    total,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running composite field column fix for workspace: ${workspaceId} (${index} out of ${total})`,
    );

    // Find all active composite fields in this workspace
    const objectMetadataCollection = await this.objectMetadataRepository.find({
      where: { workspaceId, isActive: true },
      relations: ['fields'],
    });

    let totalColumnsAdded = 0;

    for (const objectMetadata of objectMetadataCollection) {
      const compositeFields = objectMetadata.fields.filter((field) =>
        isCompositeFieldMetadataType(field.type),
      );

      if (compositeFields.length === 0) {
        continue;
      }

      const tableName = computeObjectTargetTable(objectMetadata);
      const schemaName = getWorkspaceSchemaName(workspaceId);

      for (const field of compositeFields) {
        const compositeType = compositeTypeDefinitions.get(field.type);

        if (!compositeType) {
          this.logger.warn(
            `Composite type definition not found for field ${field.name} of type ${field.type}`,
          );
          continue;
        }

        // Check each property and add missing columns
        for (const property of compositeType.properties) {
          const columnName = computeCompositeColumnName(field, property);

          // Check if column exists
          const queryRunner = dataSource.createQueryRunner();

          try {
            const columnExists = await queryRunner.query(
              `
              SELECT column_name
              FROM information_schema.columns
              WHERE table_schema = $1
                AND table_name = $2
                AND column_name = $3
            `,
              [schemaName, tableName, columnName],
            );

            if (columnExists.length === 0) {
              // Column doesn't exist, add it
              const columnType = this.getPostgresType(property.type);
              const nullable = field.isNullable || !property.isRequired;

              await queryRunner.query(
                `
                ALTER TABLE "${schemaName}"."${tableName}"
                ADD COLUMN IF NOT EXISTS "${columnName}" ${columnType}${nullable ? '' : ' NOT NULL'}
              `,
              );

              this.logger.log(
                `Added column ${columnName} (${columnType}) to ${schemaName}.${tableName}`,
              );
              totalColumnsAdded++;
            }
          } finally {
            await queryRunner.release();
          }
        }
      }
    }

    if (totalColumnsAdded === 0) {
      this.logger.log(`No missing columns found for workspace ${workspaceId}`);
    } else {
      this.logger.log(
        `Added ${totalColumnsAdded} missing composite field columns for workspace ${workspaceId}`,
      );
    }
  }

  private getPostgresType(fieldType: string): string {
    // Map field metadata types to Postgres types
    // This is a simplified version - the real implementation should use
    // the same logic as fieldMetadataTypeToColumnType
    const typeMap: Record<string, string> = {
      RAW_JSON: 'jsonb',
      TEXT: 'text',
      UUID: 'uuid',
      BOOLEAN: 'boolean',
      DATE_TIME: 'timestamptz',
      NUMBER: 'double precision',
      NUMERIC: 'numeric',
    };

    return typeMap[fieldType] || 'jsonb';
  }
}
