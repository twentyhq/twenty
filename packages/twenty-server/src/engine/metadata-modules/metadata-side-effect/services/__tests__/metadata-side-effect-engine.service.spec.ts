import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { MetadataSideEffectHandlersModule } from 'src/engine/metadata-modules/metadata-side-effect/handlers/metadata-side-effect-handlers.module';
import { MetadataSideEffectHandlerRegistryService } from 'src/engine/metadata-modules/metadata-side-effect/registry/metadata-side-effect-handler-registry.service';
import { MetadataSideEffectEngineService } from 'src/engine/metadata-modules/metadata-side-effect/services/metadata-side-effect-engine.service';
import { type MetadataSideEffectContext } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-context.type';

const DELETED_OBJECT_ID = 'b0b0b0b0-b0b0-4000-8000-000000000001';
const DELETED_OBJECT_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000001';
const LIVE_OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000002';

const DELETED_OBJECT_VIEW_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000001';

const OBJECT_ITEM_UNIVERSAL_IDENTIFIER = 'c1c2c3c4-c5c6-4000-8000-000000000001';
const VIEW_ITEM_UNIVERSAL_IDENTIFIER = 'c1c2c3c4-c5c6-4000-8000-000000000002';
const LIVE_OBJECT_ITEM_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000003';

const EMPTY_MAPS = { byUniversalIdentifier: {} };

const buildSideEffectRelatedFlatEntityMaps = (): Partial<AllFlatEntityMaps> =>
  ({
    flatObjectMetadataMaps: EMPTY_MAPS,
    flatFieldMetadataMaps: EMPTY_MAPS,
    flatIndexMaps: EMPTY_MAPS,
    flatSearchFieldMetadataMaps: EMPTY_MAPS,
    flatViewMaps: EMPTY_MAPS,
    flatViewFieldMaps: EMPTY_MAPS,
    flatViewFieldGroupMaps: EMPTY_MAPS,
    flatPageLayoutMaps: EMPTY_MAPS,
    flatPageLayoutTabMaps: EMPTY_MAPS,
    flatPageLayoutWidgetMaps: EMPTY_MAPS,
    flatCommandMenuItemMaps: EMPTY_MAPS,
    flatNavigationMenuItemMaps: {
      byUniversalIdentifier: {
        [OBJECT_ITEM_UNIVERSAL_IDENTIFIER]: {
          universalIdentifier: OBJECT_ITEM_UNIVERSAL_IDENTIFIER,
          targetObjectMetadataUniversalIdentifier:
            DELETED_OBJECT_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: null,
        },
        [VIEW_ITEM_UNIVERSAL_IDENTIFIER]: {
          universalIdentifier: VIEW_ITEM_UNIVERSAL_IDENTIFIER,
          targetObjectMetadataUniversalIdentifier: null,
          viewUniversalIdentifier: DELETED_OBJECT_VIEW_UNIVERSAL_IDENTIFIER,
        },
        [LIVE_OBJECT_ITEM_UNIVERSAL_IDENTIFIER]: {
          universalIdentifier: LIVE_OBJECT_ITEM_UNIVERSAL_IDENTIFIER,
          targetObjectMetadataUniversalIdentifier:
            LIVE_OBJECT_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: null,
        },
      },
    },
  }) as unknown as Partial<AllFlatEntityMaps>;

const buildObjectDeleteMatrix =
  (): AllFlatEntityOperationRecordByMetadataName =>
    ({
      objectMetadata: {
        flatEntityToCreate: {},
        flatEntityToUpdate: {},
        flatEntityToDelete: {
          [DELETED_OBJECT_UNIVERSAL_IDENTIFIER]: {
            id: DELETED_OBJECT_ID,
            universalIdentifier: DELETED_OBJECT_UNIVERSAL_IDENTIFIER,
            fieldUniversalIdentifiers: [],
            indexMetadataUniversalIdentifiers: [],
            searchFieldMetadataUniversalIdentifiers: [],
            viewUniversalIdentifiers: [
              DELETED_OBJECT_VIEW_UNIVERSAL_IDENTIFIER,
            ],
            pageLayoutUniversalIdentifiers: [],
            commandMenuItemUniversalIdentifiers: [],
          },
        },
      },
    }) as unknown as AllFlatEntityOperationRecordByMetadataName;

describe('MetadataSideEffectEngineService', () => {
  let metadataSideEffectEngineService: MetadataSideEffectEngineService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DiscoveryModule, MetadataSideEffectHandlersModule],
      providers: [
        MetadataSideEffectHandlerRegistryService,
        MetadataSideEffectEngineService,
      ],
    }).compile();

    await moduleRef.init();

    metadataSideEffectEngineService =
      moduleRef.get<MetadataSideEffectEngineService>(
        MetadataSideEffectEngineService,
      );
  });

  describe('when expanding an object deletion', () => {
    it('should expand to the deletion of the navigation menu items that can no longer resolve, and leave a live object navigation menu item alone', () => {
      const result = metadataSideEffectEngineService.expandWithSideEffects({
        allFlatEntityOperationRecordByMetadataName: buildObjectDeleteMatrix(),
        sideEffectRelatedFlatEntityMaps: buildSideEffectRelatedFlatEntityMaps(),
        context: {} as MetadataSideEffectContext,
      });

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        return;
      }

      expect(
        Object.keys(
          result.allFlatEntityOperationRecordByMetadataName.navigationMenuItem
            ?.flatEntityToDelete ?? {},
        ).sort(),
      ).toEqual(
        [
          OBJECT_ITEM_UNIVERSAL_IDENTIFIER,
          VIEW_ITEM_UNIVERSAL_IDENTIFIER,
        ].sort(),
      );
    });
  });

  describe('when listing the metadata names an object operation needs loaded', () => {
    it('should include navigationMenuItem so the deletion handler can read it', () => {
      expect(
        metadataSideEffectEngineService.getSideEffectRelatedMetadataNames([
          'objectMetadata',
        ]),
      ).toContain('navigationMenuItem');
    });
  });
});
