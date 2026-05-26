import { Test, type TestingModule } from '@nestjs/testing';

import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatPageLayoutWidgetTypeValidatorService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { FlatPageLayoutWidgetValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-page-layout-widget-validator.service';

const CANVAS_TAB_UI = '00000000-0000-0000-0000-000000000aa1';
const GRID_TAB_UI = '00000000-0000-0000-0000-000000000aa2';
const WIDGET_A_UI = '00000000-0000-0000-0000-000000000111';
const WIDGET_B_UI = '00000000-0000-0000-0000-000000000222';

const CANVAS_CAP_ERROR = /CANVAS layout tab can only contain one widget/;

const tab = (
  layoutMode: PageLayoutTabLayoutMode,
  universalIdentifier: string,
): UniversalFlatPageLayoutTab =>
  ({
    universalIdentifier,
    layoutMode,
  }) as unknown as UniversalFlatPageLayoutTab;

const widget = (
  universalIdentifier: string,
  pageLayoutTabUniversalIdentifier: string,
  options?: {
    universalOverrides?: {
      pageLayoutTabUniversalIdentifier?: string;
    } | null;
  },
): FlatPageLayoutWidget =>
  ({
    universalIdentifier,
    pageLayoutTabUniversalIdentifier,
    universalOverrides: options?.universalOverrides ?? null,
    title: 'widget',
    type: 'FRONT_COMPONENT',
    gridPosition: { row: 0, column: 0, rowSpan: 12, columnSpan: 12 },
    position: { layoutMode: PageLayoutTabLayoutMode.CANVAS },
  }) as unknown as FlatPageLayoutWidget;

const mapsFrom = (entities: { universalIdentifier: string }[]): any => {
  const maps = createEmptyFlatEntityMaps() as any;

  for (const entity of entities) {
    maps.byUniversalIdentifier[entity.universalIdentifier] = entity;
  }

  return maps;
};

const buildCreateArgs = ({
  incoming,
  tabs,
  existingWidgets,
}: {
  incoming: FlatPageLayoutWidget;
  tabs: UniversalFlatPageLayoutTab[];
  existingWidgets: FlatPageLayoutWidget[];
}) =>
  ({
    flatEntityToValidate: incoming,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutTabMaps: mapsFrom(tabs),
      flatPageLayoutWidgetMaps: mapsFrom(existingWidgets),
    },
    additionalCacheDataMaps: { featureFlagsMap: {} },
    workspaceId: 'workspace-id',
    buildOptions: {} as never,
  }) as any;

const buildUpdateArgs = ({
  universalIdentifier,
  update,
  tabs,
  existingWidgets,
}: {
  universalIdentifier: string;
  update: Record<string, unknown>;
  tabs: UniversalFlatPageLayoutTab[];
  existingWidgets: FlatPageLayoutWidget[];
}) =>
  ({
    universalIdentifier,
    flatEntityUpdate: update,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutTabMaps: mapsFrom(tabs),
      flatPageLayoutWidgetMaps: mapsFrom(existingWidgets),
    },
    additionalCacheDataMaps: { featureFlagsMap: {} },
    workspaceId: 'workspace-id',
    buildOptions: {} as never,
  }) as any;

const errorsMatching = (errors: { message: string }[], matcher: RegExp) =>
  errors.filter((error) => matcher.test(error.message));

describe('FlatPageLayoutWidgetValidatorService — CANVAS widget cap', () => {
  let service: FlatPageLayoutWidgetValidatorService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FlatPageLayoutWidgetValidatorService,
        {
          provide: FlatPageLayoutWidgetTypeValidatorService,
          useValue: {
            validateFlatPageLayoutWidgetTypeSpecificitiesForCreation: () => [],
            validateFlatPageLayoutWidgetTypeSpecificitiesForUpdate: () => [],
          },
        },
      ],
    }).compile();

    service = moduleRef.get(FlatPageLayoutWidgetValidatorService);
  });

  it('rejects a second widget on a CANVAS tab', async () => {
    const canvasTab = tab(PageLayoutTabLayoutMode.CANVAS, CANVAS_TAB_UI);

    const result = await service.validateFlatPageLayoutWidgetCreation(
      buildCreateArgs({
        incoming: widget(WIDGET_B_UI, CANVAS_TAB_UI),
        tabs: [canvasTab],
        existingWidgets: [widget(WIDGET_A_UI, CANVAS_TAB_UI)],
      }),
    );

    expect(errorsMatching(result.errors, CANVAS_CAP_ERROR)).toHaveLength(1);
  });

  it('counts widgets assigned to a CANVAS tab through overrides', async () => {
    const canvasTab = tab(PageLayoutTabLayoutMode.CANVAS, CANVAS_TAB_UI);
    const gridTab = tab(PageLayoutTabLayoutMode.GRID, GRID_TAB_UI);

    const result = await service.validateFlatPageLayoutWidgetCreation(
      buildCreateArgs({
        incoming: widget(WIDGET_B_UI, CANVAS_TAB_UI),
        tabs: [canvasTab, gridTab],
        existingWidgets: [
          widget(WIDGET_A_UI, GRID_TAB_UI, {
            universalOverrides: {
              pageLayoutTabUniversalIdentifier: CANVAS_TAB_UI,
            },
          }),
        ],
      }),
    );

    expect(errorsMatching(result.errors, CANVAS_CAP_ERROR)).toHaveLength(1);
  });

  it('rejects moving a widget into an occupied CANVAS tab', async () => {
    const canvasTab = tab(PageLayoutTabLayoutMode.CANVAS, CANVAS_TAB_UI);
    const gridTab = tab(PageLayoutTabLayoutMode.GRID, GRID_TAB_UI);

    const result = await service.validateFlatPageLayoutWidgetUpdate(
      buildUpdateArgs({
        universalIdentifier: WIDGET_B_UI,
        update: {
          universalOverrides: {
            pageLayoutTabUniversalIdentifier: CANVAS_TAB_UI,
          },
        },
        tabs: [canvasTab, gridTab],
        existingWidgets: [
          widget(WIDGET_A_UI, CANVAS_TAB_UI),
          widget(WIDGET_B_UI, GRID_TAB_UI),
        ],
      }),
    );

    expect(errorsMatching(result.errors, CANVAS_CAP_ERROR)).toHaveLength(1);
  });

  it('does not apply the cap to non-CANVAS tabs', async () => {
    const gridTab = tab(PageLayoutTabLayoutMode.GRID, GRID_TAB_UI);

    const result = await service.validateFlatPageLayoutWidgetCreation(
      buildCreateArgs({
        incoming: widget(WIDGET_B_UI, GRID_TAB_UI),
        tabs: [gridTab],
        existingWidgets: [widget(WIDGET_A_UI, GRID_TAB_UI)],
      }),
    );

    expect(errorsMatching(result.errors, CANVAS_CAP_ERROR)).toHaveLength(0);
  });
});
