import { Command, CommandRunner } from 'nest-commander';

import { PrismaService } from 'src/database/prisma.service';
import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { TenantInitialisationService } from 'src/metadata/tenant-initialisation/tenant-initialisation.service';

@Command({
  name: 'database:migrate-old-schema',
  description: 'Migrate old database data into new database',
})
export class MigrateOldSchemaCommand extends CommandRunner {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly tenantInitialisationService: TenantInitialisationService,
  ) {
    super();
  }

  filterDataByWorkspace(data, workspaceId) {
    return data.reduce((filtered, elem) => {
      if (elem.workspaceId === workspaceId) {
        delete elem.workspaceId;
        filtered.push(elem);
      }
      return filtered;
    }, []);
  }

  async run() {
    try {
      const workspaces = await this.prismaService.client.workspace.findMany();
      const views: Array<any> = await this.prismaService.client
        .$queryRaw`SELECT * FROM public."views"`;
      for (const workspace of workspaces) {
        const workspaceViews = this.filterDataByWorkspace(views, workspace.id);
        await this.tenantInitialisationService.injectWorkspaceData(
          workspace.id,
          workspaceViews,
        );
      }
    } catch (e) {
      console.log(e);
    }
  }
}
