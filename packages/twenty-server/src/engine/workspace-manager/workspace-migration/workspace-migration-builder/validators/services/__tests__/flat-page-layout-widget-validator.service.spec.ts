import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
  WidgetType,
} from 'twenty-shared/types';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { WorkspaceMigrationPageLayoutWidgetActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-widget/workspace-migration-page-layout-widget-actions-builder.service';
import { FlatPageLayoutWidgetTypeValidatorService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { FlatPageLayoutWidgetValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-page-layout-widget-validator.service';

const TAB_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000001';

const buildWidget = ({
  universalIdentifier,
  index,
  heightBehavior,
  type = WidgetType.FRONT_COMPONENT,
}: {
  universalIdentifier: string;
  index: number;
  heightBehavior?: PageLayoutWidgetVerticalListHeightBehavior;
  type?: WidgetType;
}) =>
  ({
    universalIdentifier,
    title: universalIdentifier,
    type,
    isActive: true,
    pageLayoutTabUniversalIdentifier: TAB_UNIVERSAL_IDENTIFIER,
    universalOverrides: null,
    position: {
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
      heightBehavior,
    },
  }) as unknown as UniversalFlatPageLayoutWidget;

describe('FlatPageLayoutWidgetValidatorService', () => {
  const typeValidator = {
    validateFlatPageLayoutWidgetTypeSpecificitiesForCreation: () => [],
    validateFlatPageLayoutWidgetTypeSpecificitiesForUpdate: () => [],
  } as unknown as FlatPageLayoutWidgetTypeValidatorService;
  const service = new FlatPageLayoutWidgetValidatorService(typeValidator);

  const validateCreation = async ({
    widget,
    siblingWidgets = [],
    finalSiblingWidgets = siblingWidgets,
  }: {
    widget: UniversalFlatPageLayoutWidget;
    siblingWidgets?: UniversalFlatPageLayoutWidget[];
    finalSiblingWidgets?: UniversalFlatPageLayoutWidget[];
  }) =>
    service.validateFlatPageLayoutWidgetCreation({
      flatEntityToValidate: widget,
      finalFlatEntityMaps: {
        byUniversalIdentifier: Object.fromEntries(
          [widget, ...finalSiblingWidgets].map((finalWidget) => [
            finalWidget.universalIdentifier,
            finalWidget,
          ]),
        ),
      },
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
        flatPageLayoutWidgetMaps: {
          byUniversalIdentifier: Object.fromEntries(
            siblingWidgets.map((siblingWidget) => [
              siblingWidget.universalIdentifier,
              siblingWidget,
            ]),
          ),
        },
        flatPageLayoutTabMaps: {
          byUniversalIdentifier: {
            [TAB_UNIVERSAL_IDENTIFIER]: {
              universalIdentifier: TAB_UNIVERSAL_IDENTIFIER,
              layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            },
          },
        },
      },
      remainingFlatEntityMapsToValidate: { byUniversalIdentifier: {} },
      additionalCacheDataMaps: { featureFlagsMap: {} },
    } as unknown as Parameters<
      FlatPageLayoutWidgetValidatorService['validateFlatPageLayoutWidgetCreation']
    >[0]);

  it('rejects a second active TAB_VIEWPORT widget in the same tab', async () => {
    const result = await validateCreation({
      widget: buildWidget({
        universalIdentifier: 'viewport-2',
        index: 1,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'viewport-1',
          index: 0,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
      ],
    });

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'only one active TAB_VIEWPORT widget',
          ),
        }),
      ]),
    );
  });

  it('treats a legacy viewport-filling widget type as TAB_VIEWPORT', async () => {
    const result = await validateCreation({
      widget: buildWidget({
        universalIdentifier: 'viewport',
        index: 1,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'legacy-viewport',
          index: 0,
          type: WidgetType.TIMELINE,
        }),
      ],
    });

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'only one active TAB_VIEWPORT widget',
          ),
        }),
      ]),
    );
  });

  it.each(['base', 'override'] as const)(
    'counts a Timeline with a null %s position as a viewport widget',
    async (positionSource) => {
      const timeline = buildWidget({
        universalIdentifier: 'timeline',
        index: 0,
        type: WidgetType.TIMELINE,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
      });
      const result = await validateCreation({
        widget: buildWidget({
          universalIdentifier: 'viewport',
          index: 1,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
        siblingWidgets: [
          {
            ...timeline,
            ...(positionSource === 'base'
              ? { position: null }
              : { universalOverrides: { position: null } }),
          },
        ],
      });

      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining(
              'only one active TAB_VIEWPORT widget',
            ),
          }),
        ]),
      );
    },
  );

  it('rejects a new Timeline with no position when the tab already has a viewport widget', async () => {
    const result = await validateCreation({
      widget: {
        ...buildWidget({
          universalIdentifier: 'timeline',
          index: 0,
          type: WidgetType.TIMELINE,
        }),
        position: null,
      },
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'viewport',
          index: 1,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
      ],
    });

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'only one active TAB_VIEWPORT widget',
          ),
        }),
      ]),
    );
  });

  it('ignores a viewport widget explicitly detached from its original tab', async () => {
    const result = await validateCreation({
      widget: buildWidget({
        universalIdentifier: 'replacement',
        index: 0,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
      siblingWidgets: [
        {
          ...buildWidget({
            universalIdentifier: 'detached',
            index: 0,
            heightBehavior:
              PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
          }),
          universalOverrides: { pageLayoutTabUniversalIdentifier: null },
        },
      ],
    });

    expect(result.errors).toEqual([]);
  });

  it('orders fit-content widgets before legacy viewport-filling widget types', async () => {
    const result = await validateCreation({
      widget: buildWidget({
        universalIdentifier: 'fit-content',
        index: 1,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'legacy-viewport',
          index: 0,
          type: WidgetType.TIMELINE,
        }),
      ],
    });

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'must be ordered after fit-content widgets',
          ),
        }),
      ]),
    );
  });

  it('rejects TAB_VIEWPORT before an active fit-content widget', async () => {
    const result = await validateCreation({
      widget: buildWidget({
        universalIdentifier: 'viewport',
        index: 0,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'fit-content',
          index: 1,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
        }),
      ],
    });

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'must be ordered after fit-content widgets',
          ),
        }),
      ]),
    );
  });

  it('rejects a fit-content widget inserted after TAB_VIEWPORT', async () => {
    const result = await validateCreation({
      widget: buildWidget({
        universalIdentifier: 'fit-content',
        index: 1,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'viewport',
          index: 0,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
      ],
    });

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'must be ordered after fit-content widgets',
          ),
        }),
      ]),
    );
  });

  it('accepts one trailing TAB_VIEWPORT widget', async () => {
    const result = await validateCreation({
      widget: buildWidget({
        universalIdentifier: 'viewport',
        index: 1,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'fit-content',
          index: 0,
        }),
      ],
    });

    expect(result.errors).toEqual([]);
  });

  it('accepts inserting content above a viewport reindexed in the same batch', async () => {
    const result = await validateCreation({
      widget: buildWidget({ universalIdentifier: 'new-content', index: 0 }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'viewport',
          index: 0,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
      ],
      finalSiblingWidgets: [
        buildWidget({
          universalIdentifier: 'viewport',
          index: 1,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
      ],
    });
    expect(result.errors).toEqual([]);
  });

  it('accepts creating a viewport while an existing viewport becomes fit-content', async () => {
    const result = await validateCreation({
      widget: buildWidget({
        universalIdentifier: 'new-viewport',
        index: 1,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'existing-widget',
          index: 0,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
      ],
      finalSiblingWidgets: [
        buildWidget({
          universalIdentifier: 'existing-widget',
          index: 0,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
        }),
      ],
    });
    expect(result.errors).toEqual([]);
  });

  describe('migration creation and update batches', () => {
    const existingWidgetIdentifier = '00000000-0000-4000-8000-000000000002';
    const newWidgetIdentifier = '00000000-0000-4000-8000-000000000003';
    const existingWidget = buildWidget({
      universalIdentifier: existingWidgetIdentifier,
      index: 0,
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
    });

    const buildMigration = (
      targetWidgets: UniversalFlatPageLayoutWidget[],
      inferDeletionFromMissingEntities = false,
    ) => {
      const builder =
        new WorkspaceMigrationPageLayoutWidgetActionsBuilderService(service);
      Object.assign(builder, {
        logger: { perfTime: jest.fn(), perfTimeEnd: jest.fn() },
        metricsService: { recordHistogram: jest.fn() },
      });
      return builder.validateAndBuild({
        from: {
          byUniversalIdentifier: { [existingWidgetIdentifier]: existingWidget },
        },
        to: {
          byUniversalIdentifier: Object.fromEntries(
            targetWidgets.map((widget) => [widget.universalIdentifier, widget]),
          ),
        },
        dependencyOptimisticFlatEntityMaps: {
          ...createEmptyAllFlatEntityMaps(),
          flatPageLayoutWidgetMaps: {
            byUniversalIdentifier: {
              [existingWidgetIdentifier]: existingWidget,
            },
          },
          flatPageLayoutTabMaps: {
            byUniversalIdentifier: {
              [TAB_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: TAB_UNIVERSAL_IDENTIFIER,
                layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                widgetUniversalIdentifiers: [existingWidgetIdentifier],
              },
            },
          },
        },
        buildOptions: {
          isSystemBuild: false,
          applicationUniversalIdentifier: 'application',
          inferDeletionFromMissingEntities,
        },
        additionalCacheDataMaps: { featureFlagsMap: {} },
        workspaceId: 'workspace',
      } as unknown as Parameters<
        WorkspaceMigrationPageLayoutWidgetActionsBuilderService['validateAndBuild']
      >[0]);
    };

    it('builds a creation before a viewport reindex in one save', async () => {
      const result = await buildMigration([
        buildWidget({ universalIdentifier: newWidgetIdentifier, index: 0 }),
        buildWidget({
          universalIdentifier: existingWidgetIdentifier,
          index: 1,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
      ]);
      expect(result).toMatchObject({
        status: 'success',
        actions: {
          create: [
            expect.objectContaining({ metadataName: 'pageLayoutWidget' }),
          ],
          update: [
            expect.objectContaining({ metadataName: 'pageLayoutWidget' }),
          ],
        },
      });
    });

    it('keeps untouched viewport siblings when the target is a partial update', async () => {
      const result = await buildMigration([
        buildWidget({
          universalIdentifier: newWidgetIdentifier,
          index: 1,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
      ]);
      expect(result).toMatchObject({
        status: 'fail',
        errors: [
          expect.objectContaining({
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: expect.stringContaining(
                  'only one active TAB_VIEWPORT widget',
                ),
              }),
            ]),
          }),
        ],
      });
    });

    it('allows replacing a deleted viewport widget', async () => {
      const result = await buildMigration(
        [
          buildWidget({
            universalIdentifier: newWidgetIdentifier,
            index: 0,
            heightBehavior:
              PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
          }),
        ],
        true,
      );
      expect(result).toMatchObject({
        status: 'success',
        actions: {
          create: [
            expect.objectContaining({ metadataName: 'pageLayoutWidget' }),
          ],
          delete: [
            expect.objectContaining({ metadataName: 'pageLayoutWidget' }),
          ],
        },
      });
    });
  });

  it('validates a TAB_VIEWPORT transfer against the complete target map', async () => {
    const existingViewportWidget = buildWidget({
      universalIdentifier: 'existing-viewport',
      index: 1,
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
    });
    const nextViewportWidget = buildWidget({
      universalIdentifier: 'next-viewport',
      index: 0,
    });
    const finalFitContentWidget = buildWidget({
      universalIdentifier: 'existing-viewport',
      index: 0,
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
    });
    const finalViewportWidget = buildWidget({
      universalIdentifier: 'next-viewport',
      index: 1,
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
    });

    const result = await service.validateFlatPageLayoutWidgetUpdate({
      universalIdentifier: nextViewportWidget.universalIdentifier,
      flatEntityUpdate: {
        position: finalViewportWidget.position,
      },
      finalFlatEntityMaps: {
        byUniversalIdentifier: {
          [finalFitContentWidget.universalIdentifier]: finalFitContentWidget,
          [finalViewportWidget.universalIdentifier]: finalViewportWidget,
        },
      },
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
        flatPageLayoutWidgetMaps: {
          byUniversalIdentifier: {
            [existingViewportWidget.universalIdentifier]:
              existingViewportWidget,
            [nextViewportWidget.universalIdentifier]: nextViewportWidget,
          },
        },
        flatPageLayoutTabMaps: {
          byUniversalIdentifier: {
            [TAB_UNIVERSAL_IDENTIFIER]: {
              universalIdentifier: TAB_UNIVERSAL_IDENTIFIER,
              layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            },
          },
        },
      },
      additionalCacheDataMaps: { featureFlagsMap: {} },
    } as unknown as Parameters<
      FlatPageLayoutWidgetValidatorService['validateFlatPageLayoutWidgetUpdate']
    >[0]);

    expect(result.errors).toEqual([]);
  });
});
