import { Test, type TestingModule } from '@nestjs/testing';

import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatPageLayoutWidgetTypeValidatorService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { PageLayoutTabExceptionCode } from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { FlatPageLayoutWidgetValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-page-layout-widget-validator.service';

const EXISTING_TAB_UNIVERSAL_IDENTIFIER =
  '00000000-0000-0000-0000-000000000aa1';
const MISSING_TAB_UNIVERSAL_IDENTIFIER = '00000000-0000-0000-0000-000000000aa2';
const DESTINATION_TAB_UNIVERSAL_IDENTIFIER =
  '00000000-0000-0000-0000-000000000aa3';
const WIDGET_UNIVERSAL_IDENTIFIER = '00000000-0000-0000-0000-000000000111';

const tab = (
  universalIdentifier = EXISTING_TAB_UNIVERSAL_IDENTIFIER,
): UniversalFlatPageLayoutTab =>
  ({
    universalIdentifier,
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  }) as unknown as UniversalFlatPageLayoutTab;

const widget = (
  universalIdentifier = WIDGET_UNIVERSAL_IDENTIFIER,
  pageLayoutTabUniversalIdentifier = EXISTING_TAB_UNIVERSAL_IDENTIFIER,
): FlatPageLayoutWidget =>
  ({
    universalIdentifier,
    pageLayoutTabUniversalIdentifier,
    title: 'widget',
    type: 'FRONT_COMPONENT',
    gridPosition: { row: 0, column: 0, rowSpan: 12, columnSpan: 12 },
    position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
  }) as unknown as FlatPageLayoutWidget;

const mapsFrom = (entities: { universalIdentifier: string }[]): any => {
  const maps = createEmptyFlatEntityMaps() as any;

  for (const entity of entities) {
    maps.byUniversalIdentifier[entity.universalIdentifier] = entity;
  }

  return maps;
};

const buildUpdateArgs = ({
  update,
  tabs = [tab()],
  existingWidgets = [widget()],
}: {
  update: Record<string, unknown>;
  tabs?: UniversalFlatPageLayoutTab[];
  existingWidgets?: FlatPageLayoutWidget[];
}) =>
  ({
    universalIdentifier: WIDGET_UNIVERSAL_IDENTIFIER,
    flatEntityUpdate: update,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutTabMaps: mapsFrom(tabs),
      flatPageLayoutWidgetMaps: mapsFrom(existingWidgets),
    },
    additionalCacheDataMaps: { featureFlagsMap: {} },
    workspaceId: 'workspace-id',
    buildOptions: {} as never,
  }) as unknown as Parameters<
    FlatPageLayoutWidgetValidatorService['validateFlatPageLayoutWidgetUpdate']
  >[0];

describe('FlatPageLayoutWidgetValidatorService', () => {
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

  describe('validateFlatPageLayoutWidgetUpdate', () => {
    it('rejects moving a widget to an unknown tab', async () => {
      const result = await service.validateFlatPageLayoutWidgetUpdate(
        buildUpdateArgs({
          update: {
            pageLayoutTabUniversalIdentifier: MISSING_TAB_UNIVERSAL_IDENTIFIER,
          },
        }),
      );

      expect(result.errors.map((error) => error.code)).toContain(
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    });

    it('rejects moving an overridden widget to an unknown tab', async () => {
      const result = await service.validateFlatPageLayoutWidgetUpdate(
        buildUpdateArgs({
          update: {
            universalOverrides: {
              pageLayoutTabUniversalIdentifier:
                MISSING_TAB_UNIVERSAL_IDENTIFIER,
            },
          },
        }),
      );

      expect(result.errors.map((error) => error.code)).toContain(
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    });

    it('accepts moving an overridden widget to a known tab and exposes the override target as the effective tab', async () => {
      const result = await service.validateFlatPageLayoutWidgetUpdate(
        buildUpdateArgs({
          update: {
            universalOverrides: {
              pageLayoutTabUniversalIdentifier:
                DESTINATION_TAB_UNIVERSAL_IDENTIFIER,
            },
          },
          tabs: [tab(), tab(DESTINATION_TAB_UNIVERSAL_IDENTIFIER)],
        }),
      );

      expect(result.errors.map((error) => error.code)).not.toContain(
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
      expect(
        result.flatEntityMinimalInformation.pageLayoutTabUniversalIdentifier,
      ).toBe(DESTINATION_TAB_UNIVERSAL_IDENTIFIER);
    });
  });
});
