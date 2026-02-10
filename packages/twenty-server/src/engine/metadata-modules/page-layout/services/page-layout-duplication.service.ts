import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { fromCreatePageLayoutTabInputToFlatPageLayoutTabToCreate } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/from-create-page-layout-tab-input-to-flat-page-layout-tab-to-create.util';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-create-page-layout-widget-input-to-flat-page-layout-widget-to-create.util';
import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { fromCreatePageLayoutInputToFlatPageLayoutToCreate } from 'src/engine/metadata-modules/flat-page-layout/utils/from-create-page-layout-input-to-flat-page-layout-to-create.util';
import { reconstructFlatPageLayoutWithTabsAndWidgets } from 'src/engine/metadata-modules/flat-page-layout/utils/reconstruct-flat-page-layout-with-tabs-and-widgets.util';
import { type PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto } from 'src/engine/metadata-modules/page-layout/utils/from-flat-page-layout-with-tabs-and-widgets-to-page-layout-dto.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class PageLayoutDuplicationService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async duplicate({
    pageLayoutId,
    workspaceId,
  }: {
    pageLayoutId: string;
    workspaceId: string;
  }): Promise<PageLayoutDTO> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.getPageLayoutFlatEntityMaps(workspaceId);

    const originalFlatLayout = this.findOriginalLayoutOrThrow(
      pageLayoutId,
      flatPageLayoutMaps,
    );

    const originalTabsWithWidgets = this.getOriginalTabsWithWidgets(
      originalFlatLayout,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const newFlatPageLayout = fromCreatePageLayoutInputToFlatPageLayoutToCreate(
      {
        createPageLayoutInput: {
          name: originalFlatLayout.name,
          type: originalFlatLayout.type,
          objectMetadataId: originalFlatLayout.objectMetadataId,
        },
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatObjectMetadataMaps,
      },
    );

    const optimisticFlatPageLayoutMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: newFlatPageLayout,
      flatEntityMaps: createEmptyFlatEntityMaps(),
    });

    const { newFlatTabs, originalTabIdToNewTabIdMap } =
      this.createDuplicatedTabs({
        originalTabs: originalTabsWithWidgets.map(({ tab }) => tab),
        newPageLayoutId: newFlatPageLayout.id,
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatPageLayoutMaps: optimisticFlatPageLayoutMaps,
      });

    const optimisticFlatPageLayoutTabMaps = newFlatTabs.reduce(
      (maps, flatTab) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatTab,
          flatEntityMaps: maps,
        }),
      createEmptyFlatEntityMaps(),
    );

    const newFlatWidgets = this.createDuplicatedWidgets({
      originalTabsWithWidgets,
      originalTabIdToNewTabIdMap,
      workspaceId,
      flatApplication: workspaceCustomFlatApplication,
      flatPageLayoutTabMaps: optimisticFlatPageLayoutTabMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [newFlatPageLayout],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutTab: {
              flatEntityToCreate: newFlatTabs,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: newFlatWidgets,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while duplicating page layout',
      );
    }

    const {
      flatPageLayoutMaps: recomputedFlatPageLayoutMaps,
      flatPageLayoutTabMaps: recomputedFlatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps: recomputedFlatPageLayoutWidgetMaps,
    } = await this.getPageLayoutFlatEntityMaps(workspaceId);

    const newFlatLayoutWithTabsAndWidgets =
      reconstructFlatPageLayoutWithTabsAndWidgets({
        layout: findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: newFlatPageLayout.id,
          flatEntityMaps: recomputedFlatPageLayoutMaps,
        }),
        flatPageLayoutTabMaps: recomputedFlatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps: recomputedFlatPageLayoutWidgetMaps,
      });

    return fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto(
      newFlatLayoutWithTabsAndWidgets,
    );
  }

  private async getPageLayoutFlatEntityMaps(workspaceId: string) {
    return this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatPageLayoutMaps',
          'flatPageLayoutTabMaps',
          'flatPageLayoutWidgetMaps',
          'flatObjectMetadataMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );
  }

  private findOriginalLayoutOrThrow(
    pageLayoutId: string,
    flatPageLayoutMaps: FlatPageLayoutMaps,
  ): FlatPageLayout {
    const flatLayout = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: pageLayoutId,
      flatEntityMaps: flatPageLayoutMaps,
    });

    if (!isDefined(flatLayout) || isDefined(flatLayout.deletedAt)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          pageLayoutId,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    return flatLayout;
  }

  private getOriginalTabsWithWidgets(
    originalFlatLayout: FlatPageLayout,
    flatPageLayoutTabMaps: FlatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps,
  ): { tab: FlatPageLayoutTab; widgets: FlatPageLayoutWidget[] }[] {
    const widgetsByTabId = new Map<string, FlatPageLayoutWidget[]>();

    for (const widget of Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(widget) || isDefined(widget.deletedAt)) {
        continue;
      }

      const existingWidgets = widgetsByTabId.get(widget.pageLayoutTabId) ?? [];

      existingWidgets.push(widget);
      widgetsByTabId.set(widget.pageLayoutTabId, existingWidgets);
    }

    const tabs = Object.values(flatPageLayoutTabMaps.byUniversalIdentifier)
      .filter(
        (tab): tab is FlatPageLayoutTab =>
          isDefined(tab) &&
          tab.pageLayoutId === originalFlatLayout.id &&
          !isDefined(tab.deletedAt),
      )
      .sort((tabA, tabB) => (tabA.position ?? 0) - (tabB.position ?? 0));

    return tabs.map((tab) => ({
      tab,
      widgets: widgetsByTabId.get(tab.id) ?? [],
    }));
  }

  private createDuplicatedTabs({
    originalTabs,
    newPageLayoutId,
    workspaceId,
    flatApplication,
    flatPageLayoutMaps,
  }: {
    originalTabs: FlatPageLayoutTab[];
    newPageLayoutId: string;
    workspaceId: string;
    flatApplication: FlatApplication;
    flatPageLayoutMaps: AllFlatEntityMaps['flatPageLayoutMaps'];
  }): {
    newFlatTabs: FlatPageLayoutTab[];
    originalTabIdToNewTabIdMap: Map<string, string>;
  } {
    const originalTabIdToNewTabIdMap = new Map<string, string>();

    const newFlatTabs = originalTabs.map((originalTab) => {
      const newFlatTab =
        fromCreatePageLayoutTabInputToFlatPageLayoutTabToCreate({
          createPageLayoutTabInput: {
            title: originalTab.title,
            position: originalTab.position,
            pageLayoutId: newPageLayoutId,
          },
          workspaceId,
          flatApplication,
          flatPageLayoutMaps,
        });

      originalTabIdToNewTabIdMap.set(originalTab.id, newFlatTab.id);

      return newFlatTab;
    });

    return { newFlatTabs, originalTabIdToNewTabIdMap };
  }

  private createDuplicatedWidgets({
    originalTabsWithWidgets,
    originalTabIdToNewTabIdMap,
    workspaceId,
    flatApplication,
    flatPageLayoutTabMaps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    originalTabsWithWidgets: {
      tab: FlatPageLayoutTab;
      widgets: FlatPageLayoutWidget[];
    }[];
    originalTabIdToNewTabIdMap: Map<string, string>;
    workspaceId: string;
    flatApplication: FlatApplication;
    flatPageLayoutTabMaps: AllFlatEntityMaps['flatPageLayoutTabMaps'];
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
  }): FlatPageLayoutWidget[] {
    return originalTabsWithWidgets.flatMap(({ tab, widgets }) => {
      const newTabId = originalTabIdToNewTabIdMap.get(tab.id)!;

      return widgets.map((originalWidget) =>
        fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate({
          createPageLayoutWidgetInput: {
            title: originalWidget.title,
            gridPosition: originalWidget.gridPosition,
            type: originalWidget.type,
            objectMetadataId: originalWidget.objectMetadataId,
            configuration: originalWidget.configuration,
            pageLayoutTabId: newTabId,
          },
          workspaceId,
          flatApplication,
          flatPageLayoutTabMaps,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        }),
      );
    });
  }
}
