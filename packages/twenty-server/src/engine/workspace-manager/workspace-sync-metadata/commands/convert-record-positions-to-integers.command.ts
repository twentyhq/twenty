import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { Command, CommandRunner, Option } from 'nest-commander';
import { DataSource } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';

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
    @InjectObjectMetadataRepository(PersonObjectMetadata)
    private readonly personRepository: PersonRepository,
  ) {
    super();
  }

  async run(_passedParam: string[], options: RunCommandOptions): Promise<void> {
    const queryRunner = this.metadataDataSource.createQueryRunner();
    const workspaceId = options.workspaceId;

    if (!workspaceId) {
      this.logger.error('Workspace id is required');

      return;
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    this.logger.log('Converting record positions to integers');

    try {
      await this.personRepository.convertPositionsToIntegers(
        workspaceId,
        manager,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error converting record positions to integers', error);
    } finally {
      await queryRunner.release();
      this.logger.log('Record positions converted to integers');
    }
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }
}
