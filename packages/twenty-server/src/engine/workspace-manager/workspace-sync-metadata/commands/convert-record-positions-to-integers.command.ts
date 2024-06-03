import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { Command, CommandRunner, Option } from 'nest-commander';
import { DataSource } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

interface RunCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'workspace:convert-record-positions-to-integers',
  description: 'Convert record positions to integers',
})
export class ConvertRecordPositionsToIntegers extends CommandRunner {
  private readonly logger = new Logger(ConvertRecordPositionsToIntegers.name);

  constructor(
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    super();
  }

  async run(_passedParam: string[], options: RunCommandOptions): Promise<void> {
    const queryRunner = this.metadataDataSource.createQueryRunner();
    const workspaceId = options.workspaceId;

    if (!workspaceId || typeof workspaceId !== 'string') {
      this.logger.error('Workspace id is required');

      return;
    }

    const customObjectMetadataCollection = await this.metadataDataSource
      .getRepository(ObjectMetadataEntity)
      .findBy({
        workspaceId,
        isCustom: true,
      });

    const customObjectTableNames = customObjectMetadataCollection.map(
      (metadata) => metadata.nameSingular,
    );

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const transactionManager = queryRunner.manager;

    this.logger.log('Converting record positions to integers');

    try {
      await this.convertRecordPositionsToIntegers(
        customObjectTableNames,
        workspaceId,
        transactionManager,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error converting record positions to integers', error);
    } finally {
      await queryRunner.release();
      this.logger.log('Record positions converted to integers');
    }
  }

  private async convertRecordPositionsToIntegers(
    customObjectTableNames: string[],
    workspaceId: string,
    transactionManager: any,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    for (const tableName of ['company', 'person', 'opportunity']) {
      await this.convertRecordPositionsToIntegersForTable(
        tableName,
        dataSourceSchema,
        workspaceId,
        transactionManager,
      );
    }

    for (const tableName of customObjectTableNames) {
      await this.convertRecordPositionsToIntegersForTable(
        `_${tableName}`,
        dataSourceSchema,
        workspaceId,
        transactionManager,
      );
    }
  }

  private async convertRecordPositionsToIntegersForTable(
    tableName: string,
    dataSourceSchema: string,
    workspaceId: string,
    transactionManager: any,
  ): Promise<void> {
    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."${tableName}" SET position = subquery.position
      FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY position) as position
        FROM ${dataSourceSchema}."${tableName}"
      ) as subquery
      WHERE ${dataSourceSchema}."${tableName}".id = subquery.id`,
      [],
      workspaceId,
      transactionManager,
    );
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }
}
