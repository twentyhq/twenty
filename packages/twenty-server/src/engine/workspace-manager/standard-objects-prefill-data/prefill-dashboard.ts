import { type DataSource, type QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { type PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { getRevenueOverviewDashboardDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/dashboards/get-revenue-overview-dashboard-definition';

type PrefillDashboardArgs = {
  coreDataSource: DataSource;
  workspaceId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  workspaceSchemaName: string;
  twentyStandardFlatApplication: FlatApplication;
};

const buildObjectMetadataItemsFromFlatMaps = (
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): ObjectMetadataEntity[] => {
  return Object.values(flatObjectMetadataMaps.byId)
    .filter((flatObjectMetadata) => flatObjectMetadata !== undefined)
    .map((flatObjectMetadata) => {
      const fields = getFlatFieldsFromFlatObjectMetadata(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      );

      return {
        ...flatObjectMetadata,
        fields,
      } as unknown as ObjectMetadataEntity;
    });
};

export const prefillDashboard = async ({
  coreDataSource,
  workspaceId,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  workspaceSchemaName,
  twentyStandardFlatApplication,
}: PrefillDashboardArgs): Promise<void> => {
  const objectMetadataItems = buildObjectMetadataItemsFromFlatMaps(
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  );

  const dashboardDefinition = getRevenueOverviewDashboardDefinition(
    objectMetadataItems,
    workspaceId,
    twentyStandardFlatApplication.id,
  );

  const queryRunner = coreDataSource.createQueryRunner();

  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

    // 1. Create PageLayout
    await createPageLayout(
      queryRunner,
      dashboardDefinition.pageLayout,
      workspaceId,
      twentyStandardFlatApplication.id,
    );

    // 2. Create PageLayoutTabs
    await createPageLayoutTabs(
      queryRunner,
      dashboardDefinition.tabs,
      workspaceId,
      twentyStandardFlatApplication.id,
    );

    // 3. Create PageLayoutWidgets
    await createPageLayoutWidgets(
      queryRunner,
      dashboardDefinition.widgets,
      workspaceId,
      twentyStandardFlatApplication.id,
    );

    // 4. Create Dashboard record in workspace schema
    await createDashboardRecord(
      queryRunner,
      dashboardDefinition.dashboardRecord,
      workspaceSchemaName,
    );

    await queryRunner.commitTransaction();
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      try {
        await queryRunner.rollbackTransaction();
      } catch {
        // eslint-disable-next-line no-console
        console.trace(`Failed to rollback transaction: ${error}`);
      }
    }
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const createPageLayout = async (
  queryRunner: QueryRunner,
  pageLayoutDefinition: {
    id: string;
    name: string;
    type: PageLayoutType;
    objectMetadataId: null;
    workspaceId: string;
    applicationId: string;
  },
  workspaceId: string,
  applicationId: string,
): Promise<void> => {
  const pageLayoutRepository =
    queryRunner.manager.getRepository(PageLayoutEntity);

  await pageLayoutRepository.save({
    id: pageLayoutDefinition.id,
    name: pageLayoutDefinition.name,
    type: pageLayoutDefinition.type,
    objectMetadataId: pageLayoutDefinition.objectMetadataId,
    workspaceId,
    applicationId,
    universalIdentifier: uuidv4(),
  });
};

const createPageLayoutTabs = async (
  queryRunner: QueryRunner,
  tabDefinitions: Array<{
    id: string;
    title: string;
    position: number;
    pageLayoutId: string;
    workspaceId: string;
    applicationId: string;
  }>,
  workspaceId: string,
  applicationId: string,
): Promise<void> => {
  const tabRepository = queryRunner.manager.getRepository(PageLayoutTabEntity);

  const tabs = tabDefinitions.map((tab) => ({
    id: tab.id,
    title: tab.title,
    position: tab.position,
    pageLayoutId: tab.pageLayoutId,
    workspaceId,
    applicationId,
    universalIdentifier: uuidv4(),
  }));

  await tabRepository.save(tabs);
};

const createPageLayoutWidgets = async (
  queryRunner: QueryRunner,
  widgetDefinitions: Array<{
    id: string;
    pageLayoutTabId: string;
    title: string;
    type: WidgetType;
    gridPosition: GridPosition;
    configuration: Record<string, unknown>;
    objectMetadataId: string | null;
    workspaceId: string;
    applicationId: string;
  }>,
  workspaceId: string,
  applicationId: string,
): Promise<void> => {
  const widgetRepository = queryRunner.manager.getRepository(
    PageLayoutWidgetEntity,
  );

  const widgets = widgetDefinitions.map((widget) => ({
    id: widget.id,
    pageLayoutTabId: widget.pageLayoutTabId,
    title: widget.title,
    type: widget.type,
    gridPosition: widget.gridPosition,
    configuration: widget.configuration,
    objectMetadataId: widget.objectMetadataId,
    workspaceId,
    applicationId,
    universalIdentifier: uuidv4(),
  }));

  await widgetRepository.save(widgets);
};

const createDashboardRecord = async (
  queryRunner: QueryRunner,
  dashboardDefinition: {
    id: string;
    title: string;
    pageLayoutId: string;
    createdBySource: string;
    createdByWorkspaceMemberId: null;
    createdByName: string;
    updatedBySource: string;
    updatedByWorkspaceMemberId: null;
    updatedByName: string;
    position: number;
  },
  workspaceSchemaName: string,
): Promise<void> => {
  const entityManager = queryRunner.manager as WorkspaceEntityManager;

  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${workspaceSchemaName}.dashboard`, [
      'id',
      'title',
      'pageLayoutId',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'updatedBySource',
      'updatedByWorkspaceMemberId',
      'updatedByName',
      'position',
    ])
    .orIgnore()
    .values({
      id: dashboardDefinition.id,
      title: dashboardDefinition.title,
      pageLayoutId: dashboardDefinition.pageLayoutId,
      createdBySource: dashboardDefinition.createdBySource,
      createdByWorkspaceMemberId:
        dashboardDefinition.createdByWorkspaceMemberId,
      createdByName: dashboardDefinition.createdByName,
      updatedBySource: dashboardDefinition.updatedBySource,
      updatedByWorkspaceMemberId:
        dashboardDefinition.updatedByWorkspaceMemberId,
      updatedByName: dashboardDefinition.updatedByName,
      position: dashboardDefinition.position,
    })
    .execute();
};
