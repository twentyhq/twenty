import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { ObjectSystemSideEffectsOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-side-effects-on-delete-side-effect-handler.service';

type RelatedFlatEntityMaps =
  BuildSideEffectsArgs<'objectMetadata'>['relatedFlatEntityMaps'];

const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const buildFlatObjectMetadata = (
  pageLayoutUniversalIdentifiers: string[],
): MetadataUniversalFlatEntity<'objectMetadata'> =>
  ({
    universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    fieldUniversalIdentifiers: [],
    indexMetadataUniversalIdentifiers: [],
    searchFieldMetadataUniversalIdentifiers: [],
    viewUniversalIdentifiers: [],
    pageLayoutUniversalIdentifiers,
  }) as unknown as MetadataUniversalFlatEntity<'objectMetadata'>;

const buildFlatPageLayout = ({
  universalIdentifier,
  isSystemSideEffect,
}: {
  universalIdentifier: string;
  isSystemSideEffect: boolean;
}): MetadataUniversalFlatEntity<'pageLayout'> =>
  ({
    universalIdentifier,
    isSystemSideEffect,
    objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    tabUniversalIdentifiers: [],
  }) as unknown as MetadataUniversalFlatEntity<'pageLayout'>;

const buildRelatedFlatEntityMaps = (
  flatPageLayouts: MetadataUniversalFlatEntity<'pageLayout'>[],
): RelatedFlatEntityMaps =>
  ({
    flatFieldMetadataMaps: { byUniversalIdentifier: {} },
    flatIndexMaps: { byUniversalIdentifier: {} },
    flatSearchFieldMetadataMaps: { byUniversalIdentifier: {} },
    flatViewMaps: { byUniversalIdentifier: {} },
    flatViewFieldMaps: { byUniversalIdentifier: {} },
    flatViewFieldGroupMaps: { byUniversalIdentifier: {} },
    flatObjectMetadataMaps: { byUniversalIdentifier: {} },
    flatPageLayoutMaps: {
      byUniversalIdentifier: Object.fromEntries(
        flatPageLayouts.map((flatPageLayout) => [
          flatPageLayout.universalIdentifier,
          flatPageLayout,
        ]),
      ),
    },
    flatPageLayoutTabMaps: { byUniversalIdentifier: {} },
    flatPageLayoutWidgetMaps: { byUniversalIdentifier: {} },
  }) as unknown as RelatedFlatEntityMaps;

describe('ObjectSystemSideEffectsOnDeleteSideEffectHandlerService', () => {
  class TestHandler extends ObjectSystemSideEffectsOnDeleteSideEffectHandlerService {}
  const handler = new TestHandler();

  const buildSideEffects = ({
    flatEntity,
    relatedFlatEntityMaps,
  }: {
    flatEntity: MetadataUniversalFlatEntity<'objectMetadata'>;
    relatedFlatEntityMaps: RelatedFlatEntityMaps;
  }) =>
    handler.buildSideEffects({
      flatEntity,
      relatedFlatEntityMaps,
    } as BuildSideEffectsArgs<'objectMetadata'>);

  it('should resolve engine-owned page layouts through the object page layout aggregator', () => {
    const flatPageLayout = buildFlatPageLayout({
      universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000001',
      isSystemSideEffect: true,
    });

    const result = buildSideEffects({
      flatEntity: buildFlatObjectMetadata([flatPageLayout.universalIdentifier]),
      relatedFlatEntityMaps: buildRelatedFlatEntityMaps([flatPageLayout]),
    });

    expect(result).toEqual({
      status: 'success',
      operations: {
        pageLayout: {
          flatEntityToDelete: {
            [flatPageLayout.universalIdentifier]: flatPageLayout,
          },
        },
      },
    });
  });

  it('should not delete page layouts that are not engine-owned', () => {
    const flatPageLayout = buildFlatPageLayout({
      universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000002',
      isSystemSideEffect: false,
    });

    const result = buildSideEffects({
      flatEntity: buildFlatObjectMetadata([flatPageLayout.universalIdentifier]),
      relatedFlatEntityMaps: buildRelatedFlatEntityMaps([flatPageLayout]),
    });

    expect(result).toEqual({ status: 'noop' });
  });

  it('should not delete page layouts absent from the object aggregator', () => {
    const otherObjectFlatPageLayout = buildFlatPageLayout({
      universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000003',
      isSystemSideEffect: true,
    });

    const result = buildSideEffects({
      flatEntity: buildFlatObjectMetadata([]),
      relatedFlatEntityMaps: buildRelatedFlatEntityMaps([
        otherObjectFlatPageLayout,
      ]),
    });

    expect(result).toEqual({ status: 'noop' });
  });
});
