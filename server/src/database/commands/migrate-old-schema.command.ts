import { Command, CommandRunner } from 'nest-commander';

import { PrismaService } from 'src/database/prisma.service';
import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';

@Command({
  name: 'database:migrate-old-schema',
  description: 'Migrate old database data into new database',
})
export class MigrateOldSchemaCommand extends CommandRunner {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
  ) {
    super();
  }

  async run() {
    try {
      const views: Array<{ workspaceId: string }> = await this.prismaService
        .client.$queryRaw`SELECT * FROM public."views"`;
      for (const view of views) {
        const metadata =
          await this.dataSourceMetadataService.getDataSourcesMetadataFromWorkspaceId(
            view.workspaceId,
          );
        console.log(view);
        console.log(metadata);
        console.log('Copy ');
      }
    } catch (e) {
      console.log(e);
    }
  }
}
