import { Logger } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { prefillMktPayments } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-payments';

@Command({
  name: 'workspace-seed-dev:mkt-payments',
  description: 'Seed payments for mkt workspace',
})
export class MktPaymentDataSeedDevWorkspaceCommand extends CommandRunner {
  private readonly logger = new Logger(
    MktPaymentDataSeedDevWorkspaceCommand.name,
  );

  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const workspaceId = passedParams[0];
    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();
    const entityManager =
      mainDataSource.createEntityManager() as WorkspaceEntityManager;
    const schemaName = `workspace_${workspaceId}`;

    this.logger.log(
      `Seeding payments for workspace ${workspaceId} in schema ${schemaName}`,
    );

    await prefillMktPayments(entityManager, schemaName);

    this.logger.log('Payments seeding completed successfully!');
  }
}
