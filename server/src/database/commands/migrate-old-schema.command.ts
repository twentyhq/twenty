import { Command, CommandRunner } from 'nest-commander';

import { PrismaService } from 'src/database/prisma.service';
import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { TenantManagerService } from 'src/tenant-manager/tenant-manager.service';

@Command({
  name: 'database:migrate-old-schema',
  description: 'Migrate old database data into new database',
})
export class MigrateOldSchemaCommand extends CommandRunner {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly tenantManagerService: TenantManagerService,
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
    await this.tenantManagerService.injectWorkspaceData(
      table,
      workspaceId,
      filteredByWorkspace,
      columns,
    );
  }

  formatViews(views) {
    return views.map((view) => {
      return {
        id: view.id,
        name: view.name,
        objectMetadataId: view.objectId,
        type: view.type,
        workspaceId: view.workspaceId,
      };
    });
  }

  formatViewFields(viewFields) {
    return viewFields.map((viewField) => {
      return {
        fieldMetadataId: viewField.key,
        viewId: viewField.viewId,
        position: viewField.index,
        isVisible: viewField.isVisible,
        size: viewField.size,
        workspaceId: viewField.workspaceId,
      };
    });
  }

  formatViewFilters(viewFilters) {
    return viewFilters.map((viewFilter) => {
      return {
        fieldMetadataId: viewFilter.key,
        viewId: viewFilter.viewId,
        operand: viewFilter.operand,
        value: viewFilter.value,
        displayValue: viewFilter.displayValue,
        workspaceId: viewFilter.workspaceId,
      };
    });
  }

  formatViewSorts(viewSorts) {
    return viewSorts.map((viewSort) => {
      return {
        fieldMetadataId: viewSort.key,
        viewId: viewSort.viewId,
        direction: viewSort.description,
        workspaceId: viewSort.workspaceId,
      };
    });
  }

  async run() {
    try {
      const workspaces = await this.prismaService.client.workspace.findMany();
      const views: Array<any> = this.formatViews(
        await this.prismaService.client.$queryRaw`SELECT * FROM public."views"`,
      );
      const viewFields: Array<any> = this.formatViewFields(
        await this.prismaService.client
          .$queryRaw`SELECT * FROM public."viewFields"`,
      );
      const viewFilters: Array<any> = this.formatViewFilters(
        await this.prismaService.client
          .$queryRaw`SELECT * FROM public."viewFilters"`,
      );
      const viewSorts: Array<any> = this.formatViewSorts(
        await this.prismaService.client
          .$queryRaw`SELECT * FROM public."viewSorts"`,
      );
      for (const workspace of workspaces) {
        await this.copyData('view', views, workspace.id, [
          'id',
          'name',
          'objectMetadataId',
          'type',
        ]);
        await this.copyData('viewField', viewFields, workspace.id, [
          'fieldMetadataId',
          'viewId',
          'position',
          'isVisible',
          'size',
        ]);
        await this.copyData('viewFilter', viewFilters, workspace.id, [
          'fieldMetadataId',
          'viewId',
          'operand',
          'value',
          'displayValue',
        ]);
        await this.copyData('viewSort', viewSorts, workspace.id, [
          'fieldMetadataId',
          'viewId',
          'direction',
        ]);
      }
    } catch (e) {
      console.log(e);
    }
  }
}
