import { FlatEntityMapsExceptionCode } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';

const buildFlatEntityMaps = (
  entries: { id: string; universalIdentifier: string }[],
): FlatEntityMaps<any> => ({
  byUniversalIdentifier: Object.fromEntries(
    entries.map((entry) => [
      entry.universalIdentifier,
      { universalIdentifier: entry.universalIdentifier, id: entry.id },
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    entries.map((entry) => [entry.id, entry.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

const EMPTY_FLAT_ENTITY_MAPS: FlatEntityMaps<any> = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
};

describe('resolveEntityRelationUniversalIdentifiers', () => {
  describe('non-nullable relations', () => {
    it('should resolve universal identifier for a provided foreign key', () => {
      const result = resolveEntityRelationUniversalIdentifiers({
        metadataName: 'viewField',
        foreignKeyValues: {
          fieldMetadataId: 'field-id-1',
          viewId: 'view-id-1',
        },
        flatEntityMaps: {
          flatFieldMetadataMaps: buildFlatEntityMaps([
            { id: 'field-id-1', universalIdentifier: 'field-ui-1' },
          ]),
          flatViewMaps: buildFlatEntityMaps([
            { id: 'view-id-1', universalIdentifier: 'view-ui-1' },
          ]),
        },
      });

      expect(result).toEqual({
        fieldMetadataUniversalIdentifier: 'field-ui-1',
        viewUniversalIdentifier: 'view-ui-1',
      });
    });

    it('should throw when a non-nullable foreign key id does not exist in maps', () => {
      expect(() =>
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'viewField',
          foreignKeyValues: {
            fieldMetadataId: 'non-existent-id',
            viewId: 'view-id-1',
          },
          flatEntityMaps: {
            flatFieldMetadataMaps: EMPTY_FLAT_ENTITY_MAPS,
            flatViewMaps: buildFlatEntityMaps([
              { id: 'view-id-1', universalIdentifier: 'view-ui-1' },
            ]),
          },
        }),
      ).toThrow(
        expect.objectContaining({
          code: FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
        }),
      );
    });
  });

  describe('nullable relations', () => {
    it('should return null when a nullable foreign key value is null', () => {
      const result = resolveEntityRelationUniversalIdentifiers({
        metadataName: 'pageLayout',
        foreignKeyValues: {
          objectMetadataId: null,
          defaultTabToFocusOnMobileAndSidePanelId: undefined,
        },
        flatEntityMaps: {
          flatObjectMetadataMaps: EMPTY_FLAT_ENTITY_MAPS,
          flatPageLayoutTabMaps: EMPTY_FLAT_ENTITY_MAPS,
        },
      });

      expect(result).toEqual({
        objectMetadataUniversalIdentifier: null,
        defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
      });
    });

    it('should resolve universal identifier when a nullable foreign key has a valid id', () => {
      const result = resolveEntityRelationUniversalIdentifiers({
        metadataName: 'pageLayout',
        foreignKeyValues: {
          objectMetadataId: 'obj-id-1',
        },
        flatEntityMaps: {
          flatObjectMetadataMaps: buildFlatEntityMaps([
            { id: 'obj-id-1', universalIdentifier: 'obj-ui-1' },
          ]),
        },
      });

      expect(result).toEqual({
        objectMetadataUniversalIdentifier: 'obj-ui-1',
      });
    });

    it('should throw when a nullable foreign key has a non-existent id', () => {
      expect(() =>
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'pageLayout',
          foreignKeyValues: {
            objectMetadataId: 'non-existent-id',
          },
          flatEntityMaps: {
            flatObjectMetadataMaps: EMPTY_FLAT_ENTITY_MAPS,
          },
        }),
      ).toThrow(
        expect.objectContaining({
          code: FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
        }),
      );
    });
  });

  describe('partial foreign key resolution', () => {
    it('should only resolve universal identifiers for provided foreign keys', () => {
      const result = resolveEntityRelationUniversalIdentifiers({
        metadataName: 'viewField',
        foreignKeyValues: {
          fieldMetadataId: 'field-id-1',
        },
        flatEntityMaps: {
          flatFieldMetadataMaps: buildFlatEntityMaps([
            { id: 'field-id-1', universalIdentifier: 'field-ui-1' },
          ]),
        },
      });

      expect(result).toEqual({
        fieldMetadataUniversalIdentifier: 'field-ui-1',
      });
      expect(result).not.toHaveProperty('viewUniversalIdentifier');
    });
  });
});
