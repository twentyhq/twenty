import { Logger } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { prefillMktPaymentMethods } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-payment-methods';

@Command({
  name: 'workspace-seed-dev:mkt-payment-methods',
  description: 'Seed payment methods for mkt workspace',
})
export class MktPaymentMethodDataSeedDevWorkspaceCommand extends CommandRunner {
  private readonly logger = new Logger(
    MktPaymentMethodDataSeedDevWorkspaceCommand.name,
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
      `Seeding payment methods for workspace ${workspaceId} in schema ${schemaName}`,
    );

    await prefillMktPaymentMethods(entityManager, schemaName);

    this.logger.log('Payment methods seeding completed successfully!');
  }
}
