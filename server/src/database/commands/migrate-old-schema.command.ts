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

  async copyData(table, data, workspaceId, columns) {
    const filteredByWorkspace = this.filterDataByWorkspace(data, workspaceId);
    await this.tenantInitialisationService.injectWorkspaceData(
      table,
      workspaceId,
      filteredByWorkspace,
      columns,
    );
  }

  formatViewFields(ViewFields) {
    return ViewFields.map((viewField) => {
      return {
        fieldId: viewField.key,
        viewId: viewField.viewId,
        position: viewField.index,
        isVisible: viewField.isVisible,
        size: viewField.size,
        workspaceId: viewField.workspaceId,
      };
    });
  }

  async run() {
    try {
      const workspaces = await this.prismaService.client.workspace.findMany();
      const views: Array<any> = await this.prismaService.client
        .$queryRaw`SELECT * FROM public."views"`;
      const viewFields: Array<any> = this.formatViewFields(
        await this.prismaService.client
          .$queryRaw`SELECT * FROM public."viewFields"`,
      );
      /*const viewFilters: Array<any> = await this.prismaService.client
        .$queryRaw`SELECT * FROM public."viewFilters"`;
      const viewSorts: Array<any> = await this.prismaService.client
        .$queryRaw`SELECT * FROM public."viewSorts"`;*/
      for (const workspace of workspaces.splice(0, 20)) {
        await this.copyData('view', views, workspace.id, [
          'id',
          'name',
          'objectId',
          'type',
        ]);
        await this.copyData('viewField', viewFields, workspace.id, [
          'fieldId',
          'viewId',
          'position',
          'isVisible',
          'size',
        ]);
        /*await this.copyData(viewFilters, workspace.id, [
          'id',
          'fieldId',
          'position',
          'isVisible',
          'size',
        ]);
        const workspaceViewSorts = this.filterDataByWorkspace(
          viewSorts,
          workspace.id,
        );*/
      }
    } catch (e) {
      console.log(e);
    }
  }
}
