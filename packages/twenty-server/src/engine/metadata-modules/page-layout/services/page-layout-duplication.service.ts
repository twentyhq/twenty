import { Injectable } from '@nestjs/common';

import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
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
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

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

    const now = new Date().toISOString();

    const newFlatPageLayout = this.buildDuplicatedPageLayout({
      originalFlatLayout,
      flatApplication: workspaceCustomFlatApplication,
      now,
    });

    const {
      newFlatTabs,
      originalTabUniversalIdentifierToNewTabUniversalIdentifierMap,
    } = this.buildDuplicatedTabs({
      originalTabs: originalTabsWithWidgets.map(({ tab }) => tab),
      newPageLayoutUniversalIdentifier: newFlatPageLayout.universalIdentifier,
      flatApplication: workspaceCustomFlatApplication,
      now,
    });

    const newFlatWidgets = this.buildDuplicatedWidgets({
      originalTabsWithWidgets,
      originalTabUniversalIdentifierToNewTabUniversalIdentifierMap,
      flatApplication: workspaceCustomFlatApplication,
      now,
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
        layout: findFlatEntityByUniversalIdentifierOrThrow({
          universalIdentifier: newFlatPageLayout.universalIdentifier,
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

  private buildDuplicatedPageLayout({
    originalFlatLayout,
    flatApplication,
    now,
  }: {
    originalFlatLayout: FlatPageLayout;
    flatApplication: FlatApplication;
    now: string;
  }): UniversalFlatPageLayout {
    return {
      name: originalFlatLayout.name,
      type: originalFlatLayout.type,
      objectMetadataUniversalIdentifier:
        originalFlatLayout.objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      universalIdentifier: v4(),
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      tabUniversalIdentifiers: [],
      defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
    };
  }

  private buildDuplicatedTabs({
    originalTabs,
    newPageLayoutUniversalIdentifier,
    flatApplication,
    now,
  }: {
    originalTabs: FlatPageLayoutTab[];
    newPageLayoutUniversalIdentifier: string;
    flatApplication: FlatApplication;
    now: string;
  }): {
    newFlatTabs: UniversalFlatPageLayoutTab[];
    originalTabUniversalIdentifierToNewTabUniversalIdentifierMap: Map<
      string,
      string
    >;
  } {
    const originalTabUniversalIdentifierToNewTabUniversalIdentifierMap =
      new Map<string, string>();

    const newFlatTabs = originalTabs.map((originalTab) => {
      const newUniversalIdentifier = v4();

      originalTabUniversalIdentifierToNewTabUniversalIdentifierMap.set(
        originalTab.universalIdentifier,
        newUniversalIdentifier,
      );

      return {
        title: originalTab.title,
        position: originalTab.position,
        pageLayoutUniversalIdentifier: newPageLayoutUniversalIdentifier,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        universalIdentifier: newUniversalIdentifier,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
        widgetUniversalIdentifiers: [],
        icon: originalTab.icon ?? null,
        layoutMode: originalTab.layoutMode ?? PageLayoutTabLayoutMode.GRID,
      } satisfies UniversalFlatPageLayoutTab;
    });

    return {
      newFlatTabs,
      originalTabUniversalIdentifierToNewTabUniversalIdentifierMap,
    };
  }

  private buildDuplicatedWidgets({
    originalTabsWithWidgets,
    originalTabUniversalIdentifierToNewTabUniversalIdentifierMap,
    flatApplication,
    now,
  }: {
    originalTabsWithWidgets: {
      tab: FlatPageLayoutTab;
      widgets: FlatPageLayoutWidget[];
    }[];
    originalTabUniversalIdentifierToNewTabUniversalIdentifierMap: Map<
      string,
      string
    >;
    flatApplication: FlatApplication;
    now: string;
  }): UniversalFlatPageLayoutWidget[] {
    return originalTabsWithWidgets.flatMap(({ tab, widgets }) => {
      const newTabUniversalIdentifier =
        originalTabUniversalIdentifierToNewTabUniversalIdentifierMap.get(
          tab.universalIdentifier,
        );

      if (!isDefined(newTabUniversalIdentifier)) {
        throw new PageLayoutException(
          `Could not find duplicated tab for original tab ${tab.universalIdentifier}`,
          PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
        );
      }

      return widgets.map(
        (originalWidget) =>
          ({
            pageLayoutTabUniversalIdentifier: newTabUniversalIdentifier,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            universalIdentifier: v4(),
            title: originalWidget.title,
            type: originalWidget.type,
            objectMetadataUniversalIdentifier:
              originalWidget.objectMetadataUniversalIdentifier,
            gridPosition: originalWidget.gridPosition,
            position: originalWidget.position ?? null,
            applicationUniversalIdentifier: flatApplication.universalIdentifier,
            conditionalDisplay: null,
            universalConfiguration:
              originalWidget.universalConfiguration ?? null,
          }) satisfies UniversalFlatPageLayoutWidget,
      );
    });
  }
}
